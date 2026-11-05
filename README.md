# BST Lab — Interactive Binary Search Tree Visualizer

A complete, dependency-free educational website built with HTML, CSS, JavaScript and SVG. It demonstrates BST insertion, search and deletion with an algorithm trace, highlighting, pseudocode and interactive node-selection challenges with solution replays, tailored feedback, Java reference code, and randomized practice.

## Open the website

1. Unzip the folder.
2. Open `bst-visualizer` in VS Code using **File → Open Folder**.
3. Double-click `index.html` (or right-click → Open With your browser). No installation or server is required.

You can also use VS Code's *Live Server* extension if you already have it, but it is optional.

## How to explore

- Select **Insert**, **Search**, or **Delete** and enter a whole number from 0–999.
- Click the action button and then **Next step** to follow each comparison.
- Use **Previous** to revisit a step. The tree operation is finalized when you reach the final step.
- Use a preset to explore the three BST deletion cases or an unbalanced tree.
- In **The deletion challenge**, click the correct **node directly in the tree** (also works using Tab and Enter).
- After submitting an answer, click **Visualize the solution** to replay deletion with **Previous**, **Next**, or **Play/Pause**.
- Wrong answers receive explanations based on the specific node selected.
- Switch to **Fresh random trees** to practice new cases, and track your score during the session.
- In the Explorer trace, toggle **Pseudocode / Java code**. Java highlights are conceptual mappings of the trace, not execution instrumentation.
- **Reset tree** restores the seven-node example. Duplicate values are intentionally not inserted.

## Files

- `index.html` — webpage sections and accessible controls
- `style.css` — layout, typography and responsive styling
- `bst.js` — standalone BST algorithms, trace generation and invariant checks
- `script.js` — page interaction and SVG tree rendering
- `test-bst.js` — automated BST tests; run with `node test-bst.js` if Node.js is installed
- `REPORT-STARTER.md` — outline for your one-page project report (revise with your own work and learning)

## Tests

With Node.js installed, open a terminal in this folder and run:

```bash
node test-bst.js
```

Tests cover insertion, search, deletion (leaf / one child / two children), root deletion, successor with a right child, input immutability, intermediate trace invariants and a range of generated trees.

## Publishing on GitHub Pages

1. Create a public GitHub repository (for example, `bst-visualizer`).
2. Upload the website files to the root of its default branch, or push the folder using Git.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.
5. After GitHub publishes the site, open the link shown on the Pages settings screen and verify the website loads and all controls work.

The webpage does not send user data anywhere and does not need a database or an API key.

## Design and technical notes

- Nodes are laid out by sorted (in-order) rank, keeping their horizontal order correct even when the tree is skewed.
- Every algorithm trace consists of snapshots; the UI can travel forward and backward through them.
- Deletion of a node with two children follows the **in-order successor** convention.
- The replacement and removal of the successor are applied in the same snapshot, so intermediate diagrams remain valid BSTs.
- The UI intentionally limits the tree to 15 nodes to preserve readability on smaller screens.
- `bst.js` works in a browser or through Node.js for independent testing.
- Random practice generates small, distinct trees and checks the leaf, one-child, or two-child case before making a question.
- Clickable SVG groups include keyboard labels and focus support.
- Auto-play uses a 1.05-second step delay and can be paused.

## Important academic note

The course project instructions explicitly allow LLM use, but you should still check for any separate class-wide disclosure rules. Review the source, try the tests, make your own improvements, and accurately describe what you used and learned. The preliminary report must reflect your actual progress and technical understanding; this repository does not guarantee a specific grade.
