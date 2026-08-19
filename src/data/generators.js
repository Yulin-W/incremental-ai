/**
 * generators.js
 * Research automation generators across 7 historical epochs.
 */

export const GENERATORS = [
  // EPOCH 1
  {
    id: "gen_scribe",
    eraId: 1,
    epochId: 1,
    name: "Scholastic Scribe",
    icon: "📜",
    baseCost: 15,
    baseRate: 0.8,
    description: "Transcribes categorical syllogisms and philosophical debates onto parchment."
  },
  {
    id: "gen_water_clock",
    eraId: 1,
    epochId: 1,
    name: "Clepsydra & Cam Mechanism",
    icon: "💧",
    baseCost: 100,
    baseRate: 4.5,
    description: "Employs water flow and pegged cams to trigger sequential mechanical actions."
  },
  {
    id: "gen_combinatorial_wheel",
    eraId: 1,
    epochId: 1,
    name: "Llullian Volvelle",
    icon: "⚙️",
    baseCost: 650,
    baseRate: 24,
    description: "Rotating concentric parchment discs that systematically combine concepts."
  },

  // EPOCH 2
  {
    id: "gen_step_reckoner",
    eraId: 2,
    epochId: 2,
    name: "Stepped Drum Calculator",
    icon: "🔢",
    baseCost: 3500,
    baseRate: 110,
    description: "Precision brass gears capable of mechanical multiplication and division."
  },
  {
    id: "gen_punched_loom",
    eraId: 2,
    epochId: 2,
    name: "Punched-Card Mechanism",
    icon: "🎴",
    baseCost: 20000,
    baseRate: 520,
    description: "Automates complex patterns using binary hole-punched instruction cards."
  },
  {
    id: "gen_difference_engine",
    eraId: 2,
    epochId: 2,
    name: "Babbage Difference Engine",
    icon: "🏛️",
    baseCost: 120000,
    baseRate: 2400,
    description: "A multi-ton clockwork apparatus tabulating polynomial functions automatically."
  },

  // EPOCH 3
  {
    id: "gen_relay_computer",
    eraId: 3,
    epochId: 3,
    name: "Electromechanical Relay Array",
    icon: "🔌",
    baseCost: 1500000,
    baseRate: 12000,
    description: "Clicking mechanical telephone relays performing high-speed Boolean algebra."
  },
  {
    id: "gen_vacuum_tube",
    eraId: 3,
    epochId: 3,
    name: "Thermionic Vacuum Tube Bank",
    icon: "💡",
    baseCost: 10000000,
    baseRate: 65000,
    description: "Electronic switches executing thousands of logical operations per second."
  },
  {
    id: "gen_enigma_decryptor",
    eraId: 3,
    epochId: 3,
    name: "Turing Bombe Decryptor",
    icon: "📻",
    baseCost: 65000000,
    baseRate: 350000,
    description: "Specialized parallel electromechanical search engine eliminating cryptographic contradictions."
  },

  // EPOCH 4
  {
    id: "gen_lisp_machine",
    eraId: 4,
    epochId: 4,
    name: "LISP Symbolic Workstation",
    icon: "🖥️",
    baseCost: 800000000,
    baseRate: 3500000,
    description: "Hardware microcoded natively for recursive symbolic manipulation and garbage collection."
  },
  {
    id: "gen_rule_engine",
    eraId: 4,
    epochId: 4,
    name: "Production Rule Engine",
    icon: "📑",
    baseCost: 5000000000,
    baseRate: 18000000,
    description: "Inference engine evaluating thousands of domain-specific IF-THEN expert clauses."
  },
  {
    id: "gen_heuristic_searcher",
    eraId: 4,
    epochId: 4,
    name: "Minimax Alpha-Beta Searcher",
    icon: "🌲",
    baseCost: 32000000000,
    baseRate: 95000000,
    description: "Explores deep decision trees by pruning unpromising branches with heuristic scores."
  },

  // EPOCH 5
  {
    id: "gen_backprop_rig",
    eraId: 5,
    epochId: 5,
    name: "Backpropagation Gradient Rig",
    icon: "📈",
    baseCost: 800000000000,
    baseRate: 900000000,
    description: "Iteratively calculates chain-rule partial derivatives to update multi-layer weights."
  },
  {
    id: "gen_svm_kernel",
    eraId: 5,
    epochId: 5,
    name: "Support Vector Kernel Cluster",
    icon: "📐",
    baseCost: 5000000000000,
    baseRate: 4800000000,
    description: "Maps noisy data into infinite-dimensional Hilbert spaces for maximum-margin separation."
  },
  {
    id: "gen_gpu_matrix_farm",
    eraId: 5,
    epochId: 5,
    name: "Parallel Matrix GPU Farm",
    icon: "🖲️",
    baseCost: 35000000000000,
    baseRate: 25000000000,
    description: "Commercial graphics hardware repurposed for massive parallel floating-point matrix multiplication."
  },

  // EPOCH 6
  {
    id: "gen_tpu_pod",
    eraId: 6,
    epochId: 6,
    name: "Tensor Acceleration Pod",
    icon: "🧊",
    baseCost: 650000000000000,
    baseRate: 250000000000,
    description: "Application-specific integrated circuits featuring systolic arrays for ultra-fast matrix math."
  },
  {
    id: "gen_attention_head",
    eraId: 6,
    epochId: 6,
    name: "Multi-Head Attention Cluster",
    icon: "✨",
    baseCost: 4000000000000000,
    baseRate: 1400000000000,
    description: "Calculates global pairwise token dependencies simultaneously without recurrent bottlenecks."
  },
  {
    id: "gen_pretrain_supercluster",
    eraId: 6,
    epochId: 6,
    name: "Exascale Pretraining Supercluster",
    icon: "🌐",
    baseCost: 28000000000000000,
    baseRate: 7500000000000,
    description: "Thousands of interconnected accelerators digesting trillions of multimodal web tokens."
  },

  // EPOCH 7
  {
    id: "gen_reasoning_loop",
    eraId: 7,
    epochId: 7,
    name: "Deliberative Reasoning Engine",
    icon: "🔍",
    baseCost: 800000000000000000,
    baseRate: 40000000000000,
    description: "Allocates inference-time test compute to explore, evaluate, and self-correct solution paths."
  },
  {
    id: "gen_agent_swarm",
    eraId: 7,
    epochId: 7,
    name: "Tool-Augmented Agent Swarm",
    icon: "🤖",
    baseCost: 5000000000000000000,
    baseRate: 220000000000000,
    description: "Hierarchical autonomous agent network operating terminal shells, compilers, and APIs."
  },
  {
    id: "gen_frontier_foundation",
    eraId: 7,
    epochId: 7,
    name: "Autonomous Frontier Synthesis Core",
    icon: "🌌",
    baseCost: 35000000000000000000,
    baseRate: 1200000000000000,
    description: "Self-evolving foundation intelligence capable of generating novel scientific hypotheses."
  }
];
