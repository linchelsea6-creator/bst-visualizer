/* UI controller. All tree operations are defined separately in bst.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const EXAMPLE = [50, 30, 70, 20, 40, 60, 80];
  const LIMIT = 15;
  let tree = BST.fromValues(EXAMPLE);
  let operation = 'insert';
  let currentTrace = null;
  let index = -1;
  let codeMode = 'pseudo';

  const pseudocode = {
    insert: [
      'insert(root, value):',
      '  compare value with current node',
      '  if equal: stop (no duplicates)',
      '  if smaller: left; else: right',
      '  if child is null: add new node'
    ],
    search: [
      'search(root, value):',
      '  compare value with current node',
      '  if equal: return FOUND',
      '  if smaller: left; else: right',
      '  if null: return NOT FOUND'
    ],
    delete: [
      'delete(root, value):',
      '  compare value with node',
      '  if smaller: left; else: right',
      '  if null: value not found',
      '  if found: inspect children',
      '  case 0: remove leaf',
      '  case 1: promote its child',
      '  case 2: find next larger value',
      '  successor = min(right subtree)',
      '  replace target with successor',
      '  unlink old successor node'
    ]
  };
  // Real Java reference implementations. A trace points at the relevant conceptual line;
  // recursion is represented with the appropriate branch highlighted.
  const javaCode = {
    insert: [
      'Node insert(Node root, int value) {',
      '  if (root == null) return new Node(value);',
      '  if (value < root.value)',
      '    root.left = insert(root.left, value);',
      '  else if (value > root.value)',
      '    root.right = insert(root.right, value);',
      '  return root; // duplicates unchanged',
      '}'
    ],
    search: [
      'boolean search(Node root, int value) {',
      '  if (root == null) return false;',
      '  if (value == root.value) return true;',
      '  if (value < root.value)',
      '    return search(root.left, value);',
      '  return search(root.right, value);',
      '}'
    ],
    delete: [
      'Node delete(Node root, int value) {',
      '  if (root == null) return null;',
      '  if (value < root.value)',
      '    root.left = delete(root.left, value);',
      '  else if (value > root.value)',
      '    root.right = delete(root.right, value);',
      '  else { // found node',
      '    if (root.left == null) return root.right;',
      '    if (root.right == null) return root.left;',
      '    Node s = root.right;',
      '    while (s.left != null) s = s.left;',
      '    root.value = s.value;',
      '    root.right = delete(root.right, s.value);',
      '  }',
      '  return root;',
      '}'
    ]
  };
  const javaLine = {
    insert: { 0:0, 1:2, 2:6, 3:3, 4:1 },
    search: { 0:0, 1:2, 2:2, 3:4, 4:1 },
    delete: { 0:0, 1:2, 2:3, 3:1, 4:6, 5:7, 6:7, 7:9, 8:10, 9:11, 10:12 }
  };
  function svgEl(name, attributes = {}, parent) {
    const el = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
    if (parent) parent.appendChild(el);
    return el;
  }
  function textEl(svg, str, x, y, attributes = {}) {
    const el = svgEl('text', { x, y, ...attributes }, svg);
    el.textContent = String(str);
    return el;
  }
  // Position nodes by their in-order rank: labels don't overlap on skewed trees.
  function draw(svg, root, active = [], status = 'visit', emphasize = null) {
    svg.replaceChildren();
    const nodes = [], edges = [];
    const walk = (n, depth = 0, parent = null) => {
      if (!n) return;
      walk(n.left, depth + 1, n);
      nodes.push({ value: n.value, depth, parent: parent && parent.value });
      walk(n.right, depth + 1, n);
    };
    walk(root);
    if (!nodes.length) {
      svg.setAttribute('viewBox', '0 0 760 350');
      textEl(svg, 'Empty tree — insert a value to begin', 380, 165, { 'text-anchor': 'middle', fill: '#93a0b3', 'font-size': 16 });
      return;
    }
    const width = 760, maxDepth = Math.max(...nodes.map(n => n.depth));
    const height = Math.max(350, 110 + maxDepth * 69);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const usable = width - 100;
    const stepX = nodes.length === 1 ? 0 : usable / (nodes.length - 1);
    nodes.forEach((n, i) => { n.x = nodes.length === 1 ? width / 2 : 50 + i * stepX; n.y = 45 + n.depth * 69; });
    const map = new Map(nodes.map(n => [n.value, n]));
    nodes.forEach(n => { if (n.parent !== null) { const p = map.get(n.parent); if (p) edges.push([p, n]); } });
    edges.forEach(([p, n]) => svgEl('line', { x1: p.x, y1: p.y, x2: n.x, y2: n.y, class: 'tree-edge' }, svg));
    nodes.forEach(n => {
      const isActive = active.includes(n.value);
      const marked = n.value === emphasize;
      const group = svgEl('g', { 'aria-label': `Node ${n.value}` }, svg);
      const circleClass = marked ? 'miss-node' : isActive ? (status === 'success' ? 'success-node' : status === 'miss' ? 'miss-node' : 'active-node') : '';
      svgEl('circle', { cx: n.x, cy: n.y, r: 23, class: `tree-node ${circleClass}` }, group);
      textEl(group, n.value, n.x, n.y + 1, { class: 'tree-label' });
      if (n.depth === 0) textEl(group, 'ROOT', n.x, n.y - 35, { fill: '#9aa5b4', 'font-size': 9, 'text-anchor': 'middle', 'font-weight': 850, 'letter-spacing': 1.1 });
    });
  }
  function updateStats(displayTree) {
    $('stat-nodes').textContent = BST.count(displayTree);
    $('stat-height').textContent = BST.height(displayTree);
    $('stat-inorder').textContent = BST.inOrder(displayTree).join(', ') || 'empty';
  }
  function setPseudocode(line = -1) {
    const container = $('code-panel');
    container.replaceChildren();
    $('code-name').textContent = operation.toUpperCase();
    $('code-heading').textContent = codeMode === 'java' ? 'JAVA REFERENCE · CONCEPTUAL TRACE' : 'ALGORITHM PSEUDOCODE';
    const lines = codeMode === 'java' ? javaCode[operation] : pseudocode[operation];
    const focus = codeMode === 'java' ? (javaLine[operation][line] ?? -1) : line;
    lines.forEach((code, i) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line' + (i === focus ? ' highlight' : '');
      const lineNum = document.createElement('span'); lineNum.className = 'code-index'; lineNum.textContent = String(i + 1).padStart(2, '0');
      const codeText = document.createElement('span'); codeText.textContent = code;
      lineEl.append(lineNum, codeText); container.append(lineEl);
    });
  }
  function render() {
    const hasTrace = Boolean(currentTrace);
    let displayTree = tree;
    let step = null;
    if (hasTrace) {
      step = currentTrace.steps[index];
      displayTree = step.tree;
      $('step-text').textContent = step.message;
      $('step-tag').textContent = step.status.toUpperCase().replace('-', ' ');
      $('step-count').textContent = `${index + 1} / ${currentTrace.steps.length}`;
      $('step-progress').style.width = `${((index + 1) / currentTrace.steps.length) * 100}%`;
      $('prev-btn').disabled = index === 0;
      $('next-btn').disabled = index >= currentTrace.steps.length - 1;
      $('next-btn').textContent = index === currentTrace.steps.length - 2 ? 'Finish →' : 'Next step →';
    } else {
      $('step-text').textContent = 'Choose an operation and a value to see each decision in the tree.';
      $('step-tag').textContent = 'READY';
      $('step-count').textContent = '0 / 0';
      $('step-progress').style.width = '0%';
      $('prev-btn').disabled = true;
      $('next-btn').disabled = true;
      $('next-btn').textContent = 'Next step →';
    }
    draw($('tree-svg'), displayTree, step ? step.active : [], step ? step.status : 'visit');
    updateStats(displayTree);
    setPseudocode(step ? step.line : -1);
  }
  function stepTo(next) {
    if (!currentTrace) return;
    index = Math.min(Math.max(next, 0), currentTrace.steps.length - 1);
    if (index === currentTrace.steps.length - 1) tree = BST.clone(currentTrace.tree);
    render();
  }
  function start(action, value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 999) {
      $('step-text').textContent = 'Please enter a whole number from 0 to 999.';
      return;
    }
    if (action === 'insert' && !BST.search(tree, value) && BST.count(tree) >= LIMIT) {
      currentTrace = null;
      render();
      $('step-text').textContent = `This demo supports up to ${LIMIT} nodes to keep the diagram readable. Delete a value or reset first.`;
      return;
    }
    currentTrace = BST.trace(tree, action, value);
    index = 0;
    // Tree changes are committed only when reaching the last trace step.
    render();
  }
  function chooseOperation(op) {
    operation = op;
    document.querySelectorAll('[data-operation]').forEach(button => {
      const active = button.dataset.operation === op;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    $('go-btn').textContent = `${op[0].toUpperCase() + op.slice(1)} node ↗`;
    currentTrace = null;
    render();
  }
  document.querySelectorAll('[data-code-mode]').forEach(btn => btn.addEventListener('click', () => {
    codeMode = btn.dataset.codeMode;
    document.querySelectorAll('[data-code-mode]').forEach(b => {
      const on = b.dataset.codeMode === codeMode;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', String(on));
    });
    render();
  }));
  document.querySelectorAll('[data-operation]').forEach(btn => btn.addEventListener('click', () => chooseOperation(btn.dataset.operation)));
  $('operation-form').addEventListener('submit', e => { e.preventDefault(); start(operation, Number($('node-input').value)); });
  $('next-btn').addEventListener('click', () => stepTo(index + 1));
  $('prev-btn').addEventListener('click', () => stepTo(index - 1));
  $('reset-btn').addEventListener('click', () => { tree = BST.fromValues(EXAMPLE); currentTrace = null; render(); });
  const presets = {
    leaf: { values: EXAMPLE, target: 20 },
    one: { values: [50, 30, 70, 20, 40, 35, 60, 80], target: 40 },
    two: { values: EXAMPLE, target: 50 },
    skew: { values: [10, 20, 30, 40, 50, 60, 70], target: 40 }
  };
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = presets[button.dataset.preset];
    tree = BST.fromValues(preset.values);
    currentTrace = null;
    chooseOperation('delete');
    $('node-input').value = String(preset.target);
    start('delete', preset.target);
    $('explorer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Node-selection challenges: choose the right node before replaying deletion.
  // The initial set covers all three deletion cases, with randomized follow-up practice.
  const guided = [
    { values: EXAMPLE, target: 50, type: 'TWO CHILDREN', answer: 60 },
    { values: [50, 30, 70, 20, 40, 35, 60, 80], target: 40, type: 'ONE CHILD', answer: 35 },
    { values: EXAMPLE, target: 20, type: 'LEAF NODE', answer: 20 }
  ];
  let challengeIndex = 0, question = guided[0], answered = false;
  let attempts = 0, correctCount = 0, solution = null, solutionIndex = 0, player = null;
  let lastRandomSignature = '';
  function getNode(root, value) {
    let n = root;
    while(n && n.value !== value) n = value < n.value ? n.left : n.right;
    return n;
  }
  function nodeDetails(root, target) {
    const n = getNode(root, target);
    if (!n) return null;
    const type = n.left && n.right ? 'TWO CHILDREN' : n.left || n.right ? 'ONE CHILD' : 'LEAF NODE';
    if (type === 'LEAF NODE') return { type, answer: target };
    if (type === 'ONE CHILD') return { type, answer: (n.left || n.right).value };
    let s = n.right; while (s.left) s = s.left;
    return { type, answer: s.value };
  }
  function randomProblem(avoidSignature = '') {
    for (let attempt = 0; attempt < 60; attempt++) {
      const values = [];
      while (values.length < 8 + Math.floor(Math.random() * 3)) {
        const v = 10 + Math.floor(Math.random() * 80);
        if (!values.includes(v)) values.push(v);
      }
      const root = BST.fromValues(values);
      const byType = ['TWO CHILDREN', 'ONE CHILD', 'LEAF NODE'];
      const preferred = byType[(attempts + attempt) % byType.length];
      const possibilities = values.map(target => ({ target, ...nodeDetails(root, target) })).filter(v => v.type === preferred);
      if (!possibilities.length) continue;
      const item = possibilities[Math.floor(Math.random() * possibilities.length)];
      const signature = values.join(',') + '|' + item.target;
      if (signature === avoidSignature) continue;
      lastRandomSignature = signature;
      return { values, ...item };
    }
    // A safe fallback if repeated random generation cannot produce the requested shape.
    return { ...guided[(challengeIndex + 1) % guided.length] };
  }
  function stopPlayer() {
    if (player !== null) { clearInterval(player); player = null; }
    $('solution-play').textContent = '▶ Play';
  }
  function questionText(q) {
    if (q.type === 'TWO CHILDREN') return {
      title: `Delete ${q.target}. Click its in-order successor.`,
      prompt: 'Which node is the smallest value in the right subtree? Click that circle in the tree.'
    };
    if (q.type === 'ONE CHILD') return {
      title: `Delete ${q.target}. Click the child that moves up.`,
      prompt: 'Which node gets linked directly to the deleted node’s parent? Click it in the tree.'
    };
    return { title: `Delete ${q.target}. Click the leaf to remove.`, prompt: 'A leaf has no descendants. Click the exact node to be removed.' };
  }
  function explainMistake(q, picked) {
    if (q.type === 'TWO CHILDREN') {
      const root = BST.fromValues(q.values), n = getNode(root, q.target);
      if (picked === q.target) return `The amber node ${picked} is being deleted; it cannot be its own replacement. Look in its right subtree.`;
      if (n.right && picked === n.right.value && picked !== q.answer) return `You clicked the immediate right child, ${picked}. But its left subtree contains a smaller candidate, ${q.answer}. Follow left links until you cannot go left again.`;
      if (picked < q.target) return `${picked} lies below the left side of ${q.target}. The successor must be strictly larger than the deleted value, in its right subtree.`;
      return `${picked} isn't the smallest value larger than ${q.target}. Follow the right child, then keep moving left to reach ${q.answer}.`;
    }
    if (q.type === 'ONE CHILD') {
      if (picked === q.target) return `${q.target} is removed. The surviving child ${q.answer} takes its place in the parent's link.`;
      return `${picked} stays in the tree, but it isn't the direct child of ${q.target} that must be reattached. Look for node ${q.answer}.`;
    }
    return `You clicked ${picked}, but this question deletes leaf ${q.target}. The parent drops only the link to ${q.target}; no replacement is needed.`;
  }
  function correctExplanation(q) {
    if (q.type === 'TWO CHILDREN') return `Correct: ${q.answer} is the minimum of ${q.target}'s right subtree. Copy ${q.answer} into ${q.target}'s position, then unlink the original successor node.`;
    if (q.type === 'ONE CHILD') return `Correct: ${q.answer} is ${q.target}'s only child, so the parent bypasses ${q.target} and links directly to ${q.answer}.`;
    return `Correct: ${q.target} is a leaf, so its parent’s link is simply set to null.`;
  }
  function drawChallenge() {
    let root = BST.fromValues(question.values);
    let active = [], status = 'visit', emphasize = question.target;
    if (solution) {
      const current = solution.steps[solutionIndex];
      root = current.tree; active = current.active; status = current.status;
      // After starting the replay, let the trace highlight the current node rather than
      // treating the deleted original value as a permanent amber highlight.
      emphasize = null;
      $('solution-count').textContent = `${solutionIndex + 1} / ${solution.steps.length}`;
      $('solution-message').textContent = current.message;
      $('solution-prev').disabled = solutionIndex === 0;
      $('solution-next').disabled = solutionIndex === solution.steps.length - 1;
    }
    draw($('challenge-svg'), root, active, status, emphasize);
    if (solution) return;
    const groups = $('challenge-svg').querySelectorAll('g[aria-label^="Node "]');
    groups.forEach(g => {
      const v = Number(g.getAttribute('aria-label').slice(5));
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', answered ? '-1' : '0');
      g.setAttribute('aria-label', `Choose node ${v}`);
      g.classList.add('challenge-clickable');
      if (answered && v === question.answer) g.classList.add('right-answer');
      const choose = () => selectNode(v);
      g.addEventListener('click', choose);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    });
  }
  function selectNode(value) {
    if (answered || solution) return;
    answered = true; attempts++;
    const success = value === question.answer;
    if (success) correctCount++;
    $('challenge-score').textContent = `Score: ${correctCount} / ${attempts}`;
    const feedback = $('challenge-feedback'); feedback.replaceChildren();
    const title = document.createElement('strong'); title.textContent = success ? '✓ Correct prediction!' : `Not quite — you selected ${value}.`;
    const detail = document.createElement('span'); detail.className = 'feedback-reason';
    detail.textContent = success ? correctExplanation(question) : explainMistake(question, value);
    feedback.append(title, detail); feedback.hidden = false;
    $('challenge-show').hidden = false; $('challenge-next').hidden = false;
    $('challenge-note').textContent = `Your answer: ${value}. The green node marks the correct selection, ${question.answer}.`;
    drawChallenge();
  }
  function renderChallenge() {
    stopPlayer(); answered = false; solution = null; solutionIndex = 0;
    const guidedMode = $('challenge-level').value === 'guided';
    $('challenge-number').textContent = guidedMode ? `CHALLENGE ${challengeIndex + 1} OF ${guided.length}` : 'GENERATED PRACTICE';
    $('challenge-case').textContent = question.type;
    const { title, prompt } = questionText(question);
    $('challenge-question').textContent = title;
    $('challenge-prompt').textContent = prompt;
    $('challenge-feedback').hidden = true;
    $('challenge-show').hidden = true;
    $('challenge-next').hidden = true;
    $('solution-controls').hidden = true;
    $('challenge-next').textContent = guidedMode && challengeIndex === guided.length - 1 ? 'Restart guided challenges ↻' : 'Next challenge →';
    $('challenge-note').textContent = 'Click a node in the tree to answer. The amber node is being deleted.';
    const instructions = $('answer-options'); instructions.replaceChildren();
    const tip = document.createElement('div'); tip.className = 'challenge-instruction';
    tip.textContent = '👆 Select a circle directly on the tree. Keyboard: Tab to a node, then Enter or Space.';
    instructions.appendChild(tip);
    drawChallenge();
  }
  function solutionTo(i) {
    if (!solution) return;
    solutionIndex = Math.max(0, Math.min(i, solution.steps.length - 1));
    drawChallenge();
    if (solutionIndex === solution.steps.length - 1) stopPlayer();
  }
  $('challenge-show').addEventListener('click', () => {
    if (!answered) return;
    solution = BST.trace(BST.fromValues(question.values), 'delete', question.target);
    solutionIndex = 0;
    $('solution-controls').hidden = false;
    $('challenge-show').hidden = true;
    $('challenge-note').textContent = 'Step through the actual deletion algorithm, or press Play to watch it unfold.';
    solutionTo(0);
  });
  $('solution-prev').addEventListener('click', () => { stopPlayer(); solutionTo(solutionIndex - 1); });
  $('solution-next').addEventListener('click', () => { stopPlayer(); solutionTo(solutionIndex + 1); });
  $('solution-play').addEventListener('click', () => {
    if (!solution) return;
    if (player !== null) { stopPlayer(); return; }
    if (solutionIndex >= solution.steps.length - 1) solutionTo(0);
    $('solution-play').textContent = 'Ⅱ Pause';
    player = setInterval(() => solutionTo(solutionIndex + 1), 1050);
  });
  function newQuestion() {
    if ($('challenge-level').value === 'random') question = randomProblem(lastRandomSignature);
    else { challengeIndex = (challengeIndex + 1) % guided.length; question = guided[challengeIndex]; }
    renderChallenge();
  }
  $('challenge-next').addEventListener('click', newQuestion);
  $('challenge-new').addEventListener('click', () => {
    if ($('challenge-level').value === 'random') question = randomProblem(lastRandomSignature);
    else { challengeIndex = (challengeIndex + 1) % guided.length; question = guided[challengeIndex]; }
    renderChallenge();
  });
  $('challenge-level').addEventListener('change', () => {
    challengeIndex = 0;
    question = $('challenge-level').value === 'random' ? randomProblem() : guided[0];
    renderChallenge();
  });
  render();
  renderChallenge();
})();
