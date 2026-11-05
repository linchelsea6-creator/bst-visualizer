# Preliminary / Final Report — BST Lab (starter outline)

**Student:** [Your name and NetID]
**Project:** Binary Search Tree Visualizer (BST Lab)
**Public website:** [Add actual published link]
**Repository:** [Add actual link, if public]

## Quality — what the visualization teaches

BST Lab demonstrates insertion, searching and the three cases of deletion in a binary search tree. Each operation can be traced one step at a time, with a highlighted node, a plain-language explanation, and corresponding pseudocode. The prediction challenge asks students to click a node in the diagram rather than select a multiple-choice response. After answering, students can replay the actual deletion one step at a time or use auto-play; specific wrong choices trigger explanations of the misconception. Randomized trees provide additional practice and a per-session score. [Add what you personally tested with classmates, and what you improved from their feedback.]

## Novelty — comparison with related work

Existing tools to review and compare include VisuAlgo's BST visualizer (https://visualgo.net/en/bst) and the BST/AVL visualizers listed in the assignment. Do not claim that step-by-step animation or quizzes are entirely new: similar features may already exist. Explain specifically how your *particular* combination of direct node selection, answer-dependent explanations, replay of the exact operation, randomized questions and scenario presets helps beginners, and verify comparisons against the actual websites before final submission.

## Technicality — tools and methods

The site uses HTML for structure, CSS for responsive styling, JavaScript for interaction and BST algorithms, and SVG for rendering nodes and edges. The Explorer includes both pseudocode and Java reference code (trace highlights are conceptual, not Java runtime instrumentation). The algorithm module is separated from the UI. It supports immutable operation traces that drive a forward/backward stepper. The in-order layout preserves relative sorting, while automated Node.js tests exercise all deletion cases and check BST invariants. [Add what you personally learned, any AI tools you used/disclosure required, changes you made, and any verified test results.]

## Next steps / feedback request (for preliminary submission)

[Describe what remains unfinished or may need revision. Ask the teaching staff whether the educational differentiation and technical scope are sufficient for the highest extra-credit evaluation.]

---
**Note:** This is a starter outline, not a finished one-page report. Revise and shorten to one page as needed, and only report features, tests and user feedback that actually occurred.
