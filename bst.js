/* BST Lab: framework-free algorithm module. Supports Node.js tests and browser usage. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BST = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function node(value) { return { value, left: null, right: null }; }
  function clone(root) {
    return root ? { value: root.value, left: clone(root.left), right: clone(root.right) } : null;
  }
  function insert(root, value) {
    if (!root) return node(value);
    if (value < root.value) root.left = insert(root.left, value);
    else if (value > root.value) root.right = insert(root.right, value);
    return root;
  }
  function search(root, value) {
    let current = root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
  function remove(root, value) {
    if (!root) return null;
    if (value < root.value) root.left = remove(root.left, value);
    else if (value > root.value) root.right = remove(root.right, value);
    else {
      if (!root.left) return root.right;
      if (!root.right) return root.left;
      let successor = root.right;
      while (successor.left) successor = successor.left;
      root.value = successor.value;
      root.right = remove(root.right, successor.value);
    }
    return root;
  }
  function inOrder(root, out = []) {
    if (root) { inOrder(root.left, out); out.push(root.value); inOrder(root.right, out); }
    return out;
  }
  function validate(root, min = -Infinity, max = Infinity) {
    return !root || (root.value > min && root.value < max && validate(root.left, min, root.value) && validate(root.right, root.value, max));
  }
  function height(root) { return root ? 1 + Math.max(height(root.left), height(root.right)) : 0; }
  function count(root) { return root ? 1 + count(root.left) + count(root.right) : 0; }
  function fromValues(values) { return values.reduce((r, v) => insert(r, v), null); }

  // A trace is a sequence of immutable tree snapshots. These also power the animation stepper.
  function trace(tree, action, value) {
    let work = clone(tree);
    const steps = [];
    const add = (message, active = [], status = 'visit', line = 0) => {
      steps.push({ tree: clone(work), message, active: [...active], status, line });
    };
    const verb = action === 'insert' ? 'insert' : action === 'delete' ? 'delete' : 'find';
    add(`Start at the root to ${verb} ${value}.`, [], 'start', 0);
    if (action === 'search') {
      let p = work;
      while (p) {
        add(`Compare ${value} with ${p.value}.`, [p.value], 'visit', 1);
        if (p.value === value) {
          add(`Found ${value}! The search is complete.`, [p.value], 'success', 2);
          return { steps, result: 'found', tree: work };
        }
        const direction = value < p.value ? 'left' : 'right';
        add(`${value} is ${value < p.value ? 'smaller' : 'larger'} than ${p.value}; go ${direction}.`, [p.value], 'compare', 3);
        p = p[direction];
      }
      add(`${value} is not in this tree: we reached an empty link.`, [], 'miss', 4);
      return { steps, result: 'missing', tree: work };
    }
    if (action === 'insert') {
      if (!work) {
        work = node(value);
        add(`The tree was empty, so ${value} becomes the root.`, [value], 'success', 4);
        return { steps, result: 'inserted', tree: work };
      }
      let p = work;
      while (p) {
        add(`Compare ${value} with ${p.value}.`, [p.value], 'visit', 1);
        if (p.value === value) {
          add(`${value} already exists. This demonstration does not insert duplicates.`, [value], 'miss', 2);
          return { steps, result: 'duplicate', tree: work };
        }
        const direction = value < p.value ? 'left' : 'right';
        add(`${value} ${value < p.value ? '<' : '>'} ${p.value}, so follow the ${direction} link.`, [p.value], 'compare', 3);
        if (!p[direction]) {
          p[direction] = node(value);
          add(`That link was empty. Insert ${value} as the ${direction} child of ${p.value}.`, [value], 'success', 4);
          return { steps, result: 'inserted', tree: work };
        }
        p = p[direction];
      }
    }
    if (action === 'delete') {
      let parent = null, current = work, side = null;
      while (current && current.value !== value) {
        add(`Compare ${value} with ${current.value}.`, [current.value], 'visit', 1);
        parent = current;
        side = value < current.value ? 'left' : 'right';
        add(`Follow the ${side} link.`, [current.value], 'compare', 2);
        current = current[side];
      }
      if (!current) {
        add(`${value} was not found, so the tree stays unchanged.`, [], 'miss', 3);
        return { steps, result: 'missing', tree: work };
      }
      add(`Found ${value}. Inspect its children to choose the deletion case.`, [value], 'visit', 4);
      const caseName = !current.left && !current.right ? 'leaf' : (!current.left || !current.right ? 'one-child' : 'two-children');
      if (caseName !== 'two-children') {
        const replacement = current.left || current.right;
        if (!parent) work = replacement;
        else parent[side] = replacement;
        add(caseName === 'leaf'
          ? `${value} is a leaf (0 children). Remove it directly.`
          : `${value} has 1 child. Connect its parent directly to child ${replacement.value}.`,
          replacement ? [replacement.value] : [], 'success', caseName === 'leaf' ? 5 : 6);
        return { steps, result: 'deleted', tree: work, deletionCase: caseName };
      }
      add(`${value} has 2 children. Find its in-order successor: the smallest value in the right subtree.`, [value], 'compare', 7);
      let successorParent = current, successor = current.right;
      while (successor.left) {
        add(`At ${successor.value}; move left to find the right subtree's minimum.`, [successor.value], 'visit', 8);
        successorParent = successor;
        successor = successor.left;
      }
      add(`Successor is ${successor.value}. It is the next larger value.`, [successor.value], 'success', 8);
      const originalSuccessorValue = successor.value;
      add(`Next, replace ${value} with ${originalSuccessorValue} and unlink the successor's old node as one update.`, [value, originalSuccessorValue], 'compare', 9);
      current.value = originalSuccessorValue;
      if (successorParent === current) successorParent.right = successor.right;
      else successorParent.left = successor.right;
      add(`Replaced ${value} with ${originalSuccessorValue} and removed the old successor node. BST ordering is preserved.`, [originalSuccessorValue], 'success', 10);
      return { steps, result: 'deleted', tree: work, deletionCase: 'two-children' };
    }
    throw new Error('Unknown operation');
  }
  return { node, clone, insert, remove, search, inOrder, validate, height, count, fromValues, trace };
});
