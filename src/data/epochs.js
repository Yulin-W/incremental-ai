/**
 * epochs.js
 * Historical epoch schema definitions and era metadata.
 */

export const EPOCHS = [
  {
    id: 1,
    name: "Antiquity & Mechanical Automata",
    subtitle: "The Philosophical & Mechanical Roots of Artificial Life",
    timeSpan: "Prehistory – 1500s",
    themeClass: "theme-epoch-1",
    unlockThreshold: 0,
    flavor: "In ancient academies and workshops, thinkers dream of mechanical beings and formalise the first laws of syllogistic deduction."
  },
  {
    id: 2,
    name: "Formal Logic & Mechanical Calculators",
    subtitle: "The Mechanization of Arithmetic and Symbolic Computation",
    timeSpan: "1600s – 1800s",
    themeClass: "theme-epoch-2",
    unlockThreshold: 4000,
    flavor: "The Enlightenment brings geared arithmetic machines, binary logic, and the profound realization that thought can be computed."
  },
  {
    id: 3,
    name: "Birth of Computing & Cybernetics",
    subtitle: "Electronic Brains, Biological Neurons & Theoretical Limits",
    timeSpan: "1930s – 1950s",
    themeClass: "theme-epoch-3",
    unlockThreshold: 1000000,
    flavor: "Vacuum tubes, universal computing theory, and biological neural models converge to formally christen 'Artificial Intelligence' at Dartmouth."
  },
  {
    id: 4,
    name: "Symbolic AI & Knowledge Systems",
    subtitle: "Heuristic Search, Expert Rules & The First AI Winters",
    timeSpan: "1960s – 1980s",
    themeClass: "theme-epoch-4",
    unlockThreshold: 750000000,
    flavor: "Good Old-Fashioned AI attempts to encode human knowledge into explicit IF-THEN rules, discovering the brittle limits of hand-crafted logic."
  },
  {
    id: 5,
    name: "Statistical Learning & Neural Resurgence",
    subtitle: "From Deductive Rules to Inductive Data-Driven Learning",
    timeSpan: "1990s – 2000s",
    themeClass: "theme-epoch-5",
    unlockThreshold: 400000000000,
    flavor: "Backpropagation, support vector machines, and massive competitive datasets shift AI from top-down rules to bottom-up statistical patterns."
  },
  {
    id: 6,
    name: "Deep Learning & Transformers",
    subtitle: "GPU Acceleration, Deep Representations & Scaled Self-Attention",
    timeSpan: "2010s – 2020",
    themeClass: "theme-epoch-6",
    unlockThreshold: 420000000000000,
    flavor: "Massive neural networks trained on parallel GPUs shatter vision and game records, culminating in the ubiquitous Transformer self-attention architecture."
  },
  {
    id: 7,
    name: "Autonomous Agents & Frontier Models",
    subtitle: "Deliberative Reasoning, Tool-Use & Multi-Agent Swarms",
    timeSpan: "2020s – Present",
    themeClass: "theme-epoch-7",
    unlockThreshold: 340000000000000000,
    flavor: "Foundation models acquire chain-of-thought reflection, multimodal grounding, and autonomous tool-augmented problem-solving agency."
  }
];

export const ERAS = EPOCHS; // Backward compatibility alias
