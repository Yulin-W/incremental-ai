/**
 * paradigms.js
 * Historical AI Research Paradigms for Replayability & Paradigm Shifts.
 * Each paradigm represents a foundational school of thought in AI history,
 * granting distinct buffs that accelerate new game playthroughs by ~2x.
 */

export const PARADIGMS = [
  {
    id: "paradigm_symbolic",
    name: "Symbolic & Deductive Logic",
    subtitle: "Formal Axioms, Production Rules & Expert Systems",
    icon: "📐",
    themeClass: "paradigm-symbolic",
    historicalRoots: "Aristotle, Ramon Llull, Leibniz, Newell & Simon, Feigenbaum",
    quote: {
      text: "A physical symbol system has the necessary and sufficient means for general intelligent action.",
      author: "Allen Newell & Herbert A. Simon (Turing Award Lecture, 1975)"
    },
    flavor: "Prioritizes explicit formal knowledge representations, logic graphs, and deductive reasoning rules.",
    effectsSummary: "Epochs 1–3 generators produce +150% output; Epochs 1–3 milestones cost 35% less; Global baseline +25%.",
    speedRating: "Fast Early-Game",
    color: "#38bdf8"
  },
  {
    id: "paradigm_connectionist",
    name: "Connectionist & Neural Revolution",
    subtitle: "Distributed Weights, Gradient Descent & Parallel GPU Scaling",
    icon: "⚡",
    themeClass: "paradigm-connectionist",
    historicalRoots: "McCulloch-Pitts, Rosenblatt, Rumelhart, Hinton, LeCun, Bengio",
    quote: {
      text: "The brain is a massive parallel computer consisting of billions of simple interconnected processing units.",
      author: "David E. Rumelhart & James L. McClelland (1986)"
    },
    flavor: "Prioritizes bottom-up statistical learning, continuous vector representations, and massive tensor parallelization.",
    effectsSummary: "Epochs 4–7 generators cost 30% less; Milestone generator bonuses +40% stronger; Global baseline +35%.",
    speedRating: "Explosive Late-Game",
    color: "#a855f7"
  },
  {
    id: "paradigm_cybernetic",
    name: "Cybernetics & Embodied Robotics",
    subtitle: "Feedback Control, Analog Processing & Sensorimotor Loops",
    icon: "🦾",
    themeClass: "paradigm-cybernetic",
    historicalRoots: "Norbert Wiener, W. Ross Ashby, Grey Walter, Rodney Brooks",
    quote: {
      text: "We are not the stuff that abides, but patterns that perpetuate themselves in dynamic equilibrium.",
      author: "Norbert Wiener, The Human Use of Human Beings (1950)"
    },
    flavor: "Prioritizes closed-loop feedback, biological homeostasis, and active real-world embodied interaction.",
    effectsSummary: "Active Think click yield multiplied by 8x; Clicking grants +50% hardware rate burst for 15s; All generators cost 25% less.",
    speedRating: "High Active Burst",
    color: "#10b981"
  },
  {
    id: "paradigm_probabilistic",
    name: "Probabilistic & Bayesian Inference",
    subtitle: "Belief Networks, Uncertainty Modeling & Markov Decision Processes",
    icon: "🎲",
    themeClass: "paradigm-probabilistic",
    historicalRoots: "Thomas Bayes, Pierre-Simon Laplace, Judea Pearl, Richard Bellman",
    quote: {
      text: "Probability theory is nothing but common sense reduced to calculation.",
      author: "Pierre-Simon Laplace (1814)"
    },
    flavor: "Prioritizes reasoning under uncertainty, graphical causal modeling, and Bayesian belief updates.",
    effectsSummary: "Each unlocked milestone grants a compounding +4% global output bonus (~3x late-game); All milestones cost 20% less.",
    speedRating: "Compounding Growth",
    color: "#f59e0b"
  }
];
