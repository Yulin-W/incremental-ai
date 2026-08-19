# 🧠 Incremental AI — The History of Artificial Intelligence

An interactive educational idle/incremental game guiding players through the **evolution of Artificial Intelligence**—from ancient mechanical automata and formal syllogisms to modern foundation models and autonomous reasoning agents.

👉 **[Play Incremental AI Online](https://yulin-w.github.io/incremental-ai/)** • [Latest Release Notes](https://github.com/Yulin-W/incremental-ai/releases/latest)

---

## 🎯 Educational Objective

*Incremental AI* makes the history of computer science and artificial intelligence intuitive and engaging:
- **Understand Paradigm Shifts**: Discover *why* the field transitioned from deductive, top-down rule systems (GOFAI & Expert Systems) to inductive, data-driven statistical learning and self-attention.
- **Learn the True Science**: Unravel the mathematical, biological, and philosophical milestones authored by pioneers like Aristotle, Ramon Llull, Blaise Pascal, Gottfried Wilhelm Leibniz, Ada Lovelace, Charles Babbage, Alan Turing, Warren McCulloch, Walter Pitts, John McCarthy, Geoffrey Hinton, and modern researchers.
- **Explore The Codex**: Click any milestone to read plain-language educational summaries, historical figures, and original academic citations.

---

## ⏳ The 7 Historical Eras

| Era | Title | Primary Focus |
| :--- | :--- | :--- |
| **Era 1** | **Antiquity & Mechanical Automata** *(Prehistory – 1500s)* | Syllogistic logic, water clocks, and combinatorial philosophy. |
| **Era 2** | **Formal Logic & Mechanical Calculators** *(1600s – 1800s)* | Geared arithmetic, binary logic, and the first machine algorithms. |
| **Era 3** | **Birth of Computing & Cybernetics** *(1930s – 1950s)* | Universal Turing Machines, artificial neurons, and the Dartmouth Workshop. |
| **Era 4** | **Symbolic AI & Knowledge Systems** *(1960s – 1980s)* | Heuristic search, LISP, ELIZA, Expert Systems, and the AI Winters. |
| **Era 5** | **Statistical Learning & Resurgence** *(1990s – 2000s)* | Backpropagation, Support Vector Machines, Deep Blue, and ImageNet. |
| **Era 6** | **Deep Learning & Transformers** *(2010s – 2020)* | Deep Q-Networks, AlphaGo, Self-Attention, and Neural Scaling Laws. |
| **Era 7** | **Autonomous Agents & Frontier Models** *(2020s – Present)* | RLHF Alignment, Chain-of-Thought deliberation, and Tool-Augmented Agents. |

---

## 🕹️ How to Play

- **Contemplate & Derive Logic**: Click the active thought button to generate **Insights** ($\mathcal{I}$).
- **Invest in Research**: Purchase historical research tools (such as Scholastic Scribes, Difference Engines, Vacuum Tubes, GPU Rigs, and Tensor Clusters) to automate passive generation.
- **Discover Breakthroughs**: Unlock landmark historical milestones that grant powerful multipliers, reveal higher generator tiers, and unlock entries in **The Knowledge Codex**.
- **Advance Historical Eras**: Reach epoch insight thresholds to trigger paradigm transitions and experience the evolving visual themes across history.

---

## 🧪 Local Testing & Debugging

The repository provides separated commands for production-faithful local testing and rapid debug testing:

### 1. Production Mode Test (Mirrors Live GitHub Pages)
Starts a static web server without debug tooling:
```bash
# Using Python
python -m http.server 8000
# Open http://localhost:8000/ in your browser

# Or using npm
npm run test:prod
```

### 2. Debug Mode Test (Local-Only Cheat Tools)
Enables a floating, collapsible debug HUD with a **`x2 Insights`** cheat button (and `Shift+D` shortcut) for rapid milestone and era progression testing:
```bash
# Using Python / CLI (Opens debug mode)
python -m http.server 8000
# Open http://localhost:8000/?debug=true in your browser

# Or using npm
npm run test:debug
```

> [!NOTE]
> **Production Safety Invariant**: The debug HUD and cheat commands are hard-coded to require local origin (`localhost` / `127.0.0.1` / `file:`). They are automatically and completely disabled on production deployments (`yulin-w.github.io`) even if `?debug=true` is present in the URL.

---

## 📜 Intellectual Property & Fair Use

All historical milestones, paper references, and scientific concepts in this educational project are presented for academic, pedagogical, and nominative fair-use purposes. All UI components, styling, and graphics are original open-source assets.
