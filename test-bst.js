/* Run: node test-bst.js. No dependencies required. */
const assert = require('node:assert/strict');
const B = require('./bst.js');
let assertions = 0;
function eq(actual, expected, name) { assert.deepEqual(actual, expected, name); assertions++; }
function ok(actual, name) { assert.ok(actual, name); assertions++; }
const sample = [50, 30, 70, 20, 40, 60, 80];
let tree = B.fromValues(sample);
eq(B.inOrder(tree), [20, 30, 40, 50, 60, 70, 80], 'in-order sorting');
ok(B.validate(tree), 'sample tree ordering');
eq(B.height(tree), 3, 'height');
eq(B.count(tree), 7, 'count');
ok(B.search(tree, 40), 'present');
eq(B.search(tree, 99), false, 'missing');
let t = B.trace(tree, 'insert', 35);
eq(B.inOrder(t.tree), [20, 30, 35, 40, 50, 60, 70, 80], 'trace insert');
eq(B.inOrder(tree), [20, 30, 40, 50, 60, 70, 80], 'trace input stays immutable');
ok(t.steps.length > 3 && t.steps[0].tree && t.steps.at(-1).tree, 'trace captures snapshots');
eq(B.trace(tree, 'insert', 40).result, 'duplicate', 'duplicates rejected');
eq(B.trace(tree, 'search', 60).result, 'found', 'trace found');
eq(B.trace(tree, 'search', 61).result, 'missing', 'trace missing');
for (const [values, target, expectedCase, expected] of [
  [sample, 20, 'leaf', [30, 40, 50, 60, 70, 80]],
  [[50, 30, 70, 20, 40, 35, 60, 80], 40, 'one-child', [20, 30, 35, 50, 60, 70, 80]],
  [sample, 50, 'two-children', [20, 30, 40, 60, 70, 80]],
  [[50, 30, 70, 20, 40, 60, 80, 65], 50, 'two-children', [20, 30, 40, 60, 65, 70, 80]],
  [[50, 30, 70, 20, 40, 60, 80, 55], 50, 'two-children', [20, 30, 40, 55, 60, 70, 80]],
  [[10], 10, 'leaf', []],
  [[10, 5], 10, 'one-child', [5]],
]) {
  const original = B.fromValues(values);
  const trace = B.trace(original, 'delete', target);
  eq(trace.deletionCase, expectedCase, `${target} deletion case`);
  eq(B.inOrder(trace.tree), expected, `delete ${target}: sorted result`);
  ok(B.validate(trace.tree), `delete ${target}: valid BST`);
  eq(B.inOrder(original), [...values].sort((a,b)=>a-b), 'trace does not mutate input');
  for (const step of trace.steps) ok(B.validate(step.tree), 'each intermediate snapshot remains a BST');
}
eq(B.trace(B.fromValues(sample), 'delete', 999).result, 'missing', 'delete missing');
// Cross-check against a sorted Set across many random-like sequences.
for (let seed = 1; seed <= 15; seed++) {
  let rng = seed;
  const next = () => ((rng = (rng * 1664525 + 1013904223) >>> 0) % 100);
  const values = Array.from({ length: 25 }, next);
  let root = B.fromValues(values);
  const set = new Set(values);
  ok(B.validate(root), 'bulk insert invariant');
  eq(B.inOrder(root), [...set].sort((a,b)=>a-b), 'bulk insert elements');
  for (const value of values.slice(0, 13)) {
    root = B.trace(root, 'delete', value).tree;
    set.delete(value);
    ok(B.validate(root), 'bulk deletion invariant');
    eq(B.inOrder(root), [...set].sort((a,b)=>a-b), 'bulk deletion values');
  }
}
console.log(`All ${assertions} assertions passed.`);
