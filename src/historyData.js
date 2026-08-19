/**
 * historyData.js
 * Comprehensive historical database and schema for Incremental AI.
 * Contains 7 historical epochs, 21 research generators, and 28 landmark milestones.
 */

export const ERAS = [
  {
    id: 1,
    name: "Antiquity & Mechanical Automata",
    subtitle: "The Philosophical & Mechanical Roots of Artificial Life",
    timeSpan: "Prehistory – 1500s",
    themeClass: "theme-era-1",
    unlockThreshold: 0,
    flavor: "In ancient academies and workshops, thinkers dream of mechanical beings and formalise the first laws of syllogistic deduction."
  },
  {
    id: 2,
    name: "Formal Logic & Mechanical Calculators",
    subtitle: "The Mechanization of Arithmetic and Symbolic Computation",
    timeSpan: "1600s – 1800s",
    themeClass: "theme-era-2",
    unlockThreshold: 5000,
    flavor: "The Enlightenment brings geared arithmetic machines, binary logic, and the profound realization that thought can be computed."
  },
  {
    id: 3,
    name: "Birth of Computing & Cybernetics",
    subtitle: "Electronic Brains, Biological Neurons & Theoretical Limits",
    timeSpan: "1930s – 1950s",
    themeClass: "theme-era-3",
    unlockThreshold: 150000,
    flavor: "Vacuum tubes, universal computing theory, and biological neural models converge to formally christen 'Artificial Intelligence' at Dartmouth."
  },
  {
    id: 4,
    name: "Symbolic AI & Knowledge Systems",
    subtitle: "Heuristic Search, Expert Rules & The First AI Winters",
    timeSpan: "1960s – 1980s",
    themeClass: "theme-era-4",
    unlockThreshold: 5000000,
    flavor: "Good Old-Fashioned AI attempts to encode human knowledge into explicit IF-THEN rules, discovering the brittle limits of hand-crafted logic."
  },
  {
    id: 5,
    name: "Statistical Learning & Neural Resurgence",
    subtitle: "From Deductive Rules to Inductive Data-Driven Learning",
    timeSpan: "1990s – 2000s",
    themeClass: "theme-era-5",
    unlockThreshold: 200000000,
    flavor: "Backpropagation, support vector machines, and massive competitive datasets shift AI from top-down rules to bottom-up statistical patterns."
  },
  {
    id: 6,
    name: "Deep Learning & Transformers",
    subtitle: "GPU Acceleration, Deep Representations & Scaled Self-Attention",
    timeSpan: "2010s – 2020",
    themeClass: "theme-era-6",
    unlockThreshold: 10000000000,
    flavor: "Massive neural networks trained on parallel GPUs shatter vision and game records, culminating in the ubiquitous Transformer self-attention architecture."
  },
  {
    id: 7,
    name: "Autonomous Agents & Frontier Models",
    subtitle: "Deliberative Reasoning, Tool-Use & Multi-Agent Swarms",
    timeSpan: "2020s – Present",
    themeClass: "theme-era-7",
    unlockThreshold: 500000000000,
    flavor: "Foundation models acquire chain-of-thought reflection, multimodal grounding, and autonomous tool-augmented problem-solving agency."
  }
];

export const GENERATORS = [
  // ERA 1
  {
    id: "gen_scribe",
    eraId: 1,
    name: "Scholastic Scribe",
    icon: "📜",
    baseCost: 15,
    baseRate: 0.8,
    description: "Transcribes categorical syllogisms and philosophical debates onto parchment."
  },
  {
    id: "gen_water_clock",
    eraId: 1,
    name: "Clepsydra & Cam Mechanism",
    icon: "💧",
    baseCost: 100,
    baseRate: 4.5,
    description: "Employs water flow and pegged cams to trigger sequential mechanical actions."
  },
  {
    id: "gen_combinatorial_wheel",
    eraId: 1,
    name: "Llullian Volvelle",
    icon: "⚙️",
    baseCost: 650,
    baseRate: 24,
    description: "Rotating concentric parchment discs that systematically combine concepts."
  },

  // ERA 2
  {
    id: "gen_step_reckoner",
    eraId: 2,
    name: "Stepped Drum Calculator",
    icon: "🔢",
    baseCost: 3500,
    baseRate: 110,
    description: "Precision brass gears capable of mechanical multiplication and division."
  },
  {
    id: "gen_punched_loom",
    eraId: 2,
    name: "Punched-Card Mechanism",
    icon: "🎴",
    baseCost: 20000,
    baseRate: 520,
    description: "Automates complex patterns using binary hole-punched instruction cards."
  },
  {
    id: "gen_difference_engine",
    eraId: 2,
    name: "Babbage Difference Engine",
    icon: "🏛️",
    baseCost: 120000,
    baseRate: 2400,
    description: "A multi-ton clockwork apparatus tabulating polynomial functions automatically."
  },

  // ERA 3
  {
    id: "gen_relay_computer",
    eraId: 3,
    name: "Electromechanical Relay Array",
    icon: "🔌",
    baseCost: 750000,
    baseRate: 11500,
    description: "Clicking mechanical telephone relays performing high-speed Boolean algebra."
  },
  {
    id: "gen_vacuum_tube",
    eraId: 3,
    name: "Thermionic Vacuum Tube Bank",
    icon: "💡",
    baseCost: 4500000,
    baseRate: 58000,
    description: "Electronic switches executing thousands of logical operations per second."
  },
  {
    id: "gen_enigma_decryptor",
    eraId: 3,
    name: "Turing Bombe Decryptor",
    icon: "📻",
    baseCost: 28000000,
    baseRate: 290000,
    description: "Specialized parallel electromechanical search engine eliminating cryptographic contradictions."
  },

  // ERA 4
  {
    id: "gen_lisp_machine",
    eraId: 4,
    name: "LISP Symbolic Workstation",
    icon: "🖥️",
    baseCost: 180000000,
    baseRate: 1500000,
    description: "Hardware microcoded natively for recursive symbolic manipulation and garbage collection."
  },
  {
    id: "gen_rule_engine",
    eraId: 4,
    name: "Production Rule Engine",
    icon: "📑",
    baseCost: 1100000000,
    baseRate: 7800000,
    description: "Inference engine evaluating thousands of domain-specific IF-THEN expert clauses."
  },
  {
    id: "gen_heuristic_searcher",
    eraId: 4,
    name: "Minimax Alpha-Beta Searcher",
    icon: "🌲",
    baseCost: 7000000000,
    baseRate: 42000000,
    description: "Explores deep decision trees by pruning unpromising branches with heuristic scores."
  },

  // ERA 5
  {
    id: "gen_backprop_rig",
    eraId: 5,
    name: "Backpropagation Gradient Rig",
    icon: "📈",
    baseCost: 45000000000,
    baseRate: 230000000,
    description: "Iteratively calculates chain-rule partial derivatives to update multi-layer weights."
  },
  {
    id: "gen_svm_kernel",
    eraId: 5,
    name: "Support Vector Kernel Cluster",
    icon: "📐",
    baseCost: 300000000000,
    baseRate: 1300000000,
    description: "Maps noisy data into infinite-dimensional Hilbert spaces for maximum-margin separation."
  },
  {
    id: "gen_gpu_matrix_farm",
    eraId: 5,
    name: "Parallel Matrix GPU Farm",
    icon: "🖲️",
    baseCost: 2000000000000,
    baseRate: 7500000000,
    description: "Commercial graphics hardware repurposed for massive parallel floating-point matrix multiplication."
  },

  // ERA 6
  {
    id: "gen_tpu_pod",
    eraId: 6,
    name: "Tensor Acceleration Pod",
    icon: "🧊",
    baseCost: 15000000000000,
    baseRate: 45000000000,
    description: "Application-specific integrated circuits featuring systolic arrays for ultra-fast matrix math."
  },
  {
    id: "gen_attention_head",
    eraId: 6,
    name: "Multi-Head Attention Cluster",
    icon: "✨",
    baseCost: 100000000000000,
    baseRate: 260000000000,
    description: "Calculates global pairwise token dependencies simultaneously without recurrent bottlenecks."
  },
  {
    id: "gen_pretrain_supercluster",
    eraId: 6,
    name: "Exascale Pretraining Supercluster",
    icon: "🌐",
    baseCost: 750000000000000,
    baseRate: 1600000000000,
    description: "Thousands of interconnected accelerators digesting trillions of multimodal web tokens."
  },

  // ERA 7
  {
    id: "gen_reasoning_loop",
    eraId: 7,
    name: "Deliberative Reasoning Engine",
    icon: "🔍",
    baseCost: 6000000000000000,
    baseRate: 11000000000000,
    description: "Allocates inference-time test compute to explore, evaluate, and self-correct solution paths."
  },
  {
    id: "gen_agent_swarm",
    eraId: 7,
    name: "Tool-Augmented Agent Swarm",
    icon: "🤖",
    baseCost: 50000000000000000,
    baseRate: 78000000000000,
    description: "Hierarchical autonomous agent network operating terminal shells, compilers, and APIs."
  },
  {
    id: "gen_frontier_foundation",
    eraId: 7,
    name: "Autonomous Frontier Synthesis Core",
    icon: "🌌",
    baseCost: 400000000000000000,
    baseRate: 550000000000000,
    description: "Self-evolving foundation intelligence capable of generating novel scientific hypotheses."
  }
];

export const MILESTONES = [
  // ERA 1 BREAKTHROUGHS
  {
    id: "ms_talos",
    eraId: 1,
    title: "Myth of Talos & Automata",
    year: "c. 750 BCE",
    cost: 50,
    prerequisites: [],
    quoteOrFigure: "Homer & Apollonius of Rhodes",
    paradigmShift: "The earliest cultural conception of artificial autonomy, created by design to execute protection routines.",
    educationalLore: "In Greek mythology, Talos was a giant bronze automaton crafted by the smith god Hephaestus to patrol Crete's shores three times daily. This ancient narrative represents humanity's earliest intuition that physical matter could be animated with purposeful behavior.",
    citation: "Apollonius Rhodius, Argonautica (3rd Century BCE)",
    effects: {
      clickMultiplier: 2.0,
      description: "Doubles active Think insight yield."
    }
  },
  {
    id: "ms_aristotle_logic",
    eraId: 1,
    title: "Aristotelian Syllogisms",
    year: "c. 350 BCE",
    cost: 250,
    prerequisites: ["ms_talos"],
    quoteOrFigure: "Aristotle",
    paradigmShift: "Decoupled reasoning from specific content, showing that deductive validity is purely structural.",
    educationalLore: "In the Organon (Prior Analytics), Aristotle formalized the categorical syllogism (e.g. All A are B; C is A; therefore C is B). By demonstrating that logical conclusions depend on the structure rather than the specific meaning of statements, he laid the philosophical blueprint for formal algorithms.",
    citation: "Aristotle, Prior Analytics (c. 350 BCE)",
    effects: {
      generatorBonus: { generatorId: "gen_scribe", factor: 2.5 },
      description: "Scholastic Scribes produce +150% more Insights."
    }
  },
  {
    id: "ms_heron_automata",
    eraId: 1,
    title: "Heron's Programmable Theatres",
    year: "c. 60 CE",
    cost: 1200,
    prerequisites: ["ms_aristotle_logic"],
    quoteOrFigure: "Heron of Alexandria",
    paradigmShift: "First mechanical implementation of sequential programmed routines using ropes and counterweights.",
    educationalLore: "Heron of Alexandria created automated mechanical plays where figurines moved, doors opened, and torches lit autonomously. The sequence was programmed by winding ropes around cylindrical axles with varying peg positions—the earliest precursor to programmable mechanical hardware.",
    citation: "Heron of Alexandria, On Automata-Making (c. 60 CE)",
    effects: {
      generatorBonus: { generatorId: "gen_water_clock", factor: 3.0 },
      description: "Clepsydra & Cam Mechanisms produce +200% more Insights."
    }
  },
  {
    id: "ms_llull_ars_magna",
    eraId: 1,
    title: "Ramon Llull's Ars Magna",
    year: "1305",
    cost: 4000,
    prerequisites: ["ms_heron_automata"],
    quoteOrFigure: "Ramon Llull",
    paradigmShift: "The first mechanical combinatorial knowledge representation system designed to discover universal truths.",
    educationalLore: "Majorcan polymath Ramon Llull designed concentric rotating parchment wheels inscribed with theological and philosophical attributes. By revolving the wheels, users could systematically generate all possible combinations of concepts—directly inspiring Leibniz's vision of symbolic computation.",
    citation: "Ramon Llull, Ars Magna Generalis et Ultima (1305)",
    effects: {
      globalMultiplier: 2.0,
      description: "Doubles all Insight production across Era 1."
    }
  },

  // ERA 2 BREAKTHROUGHS
  {
    id: "ms_pascaline",
    eraId: 2,
    title: "Pascal's Mechanical Calculator",
    year: "1642",
    cost: 12000,
    prerequisites: ["ms_llull_ars_magna"],
    quoteOrFigure: "Blaise Pascal",
    paradigmShift: "Demonstrated that arithmetic carrying operations could be performed reliably by geared mechanics.",
    educationalLore: "To assist his father with tax accounting, 19-year-old Blaise Pascal invented the Pascaline. Using a gravity-assisted carry wheel mechanism (the sautoir), it performed addition and subtraction mechanically without human mental error.",
    citation: "Pascal, B. (1645). Lettre dédicatoire à Monseigneur le Chancelier sur le sujet de la machine nouvellement inventée.",
    effects: {
      clickMultiplier: 2.5,
      generatorBonus: { generatorId: "gen_step_reckoner", factor: 2.0 },
      description: "Active clicks yield +150% more; Stepped Drum Calculators produce 2x."
    }
  },
  {
    id: "ms_leibniz_calculus",
    eraId: 2,
    title: "Leibniz's Calculus Ratiocinator",
    year: "1679",
    cost: 65000,
    prerequisites: ["ms_pascaline"],
    quoteOrFigure: "Gottfried Wilhelm Leibniz",
    paradigmShift: "Proposed binary arithmetic (0 and 1) and a universal calculation system to resolve intellectual disputes.",
    educationalLore: "Leibniz envisioned a formal symbolic language (Characteristica Universalis) and an automated reasoning framework (Calculus Ratiocinator). He famously declared that two philosophers in disagreement would simply sit down with a calculator and say: 'Calculemus!' ('Let us calculate!').",
    citation: "Leibniz, G. W. (1679). De Progressione Dyadica & Elementa Calculi.",
    effects: {
      globalMultiplier: 2.0,
      description: "Doubles all passive Insight generation."
    }
  },
  {
    id: "ms_analytical_engine",
    eraId: 2,
    title: "Babbage's Analytical Engine",
    year: "1837",
    cost: 250000,
    prerequisites: ["ms_leibniz_calculus"],
    quoteOrFigure: "Charles Babbage",
    paradigmShift: "Conceptual birth of general-purpose, Turing-complete stored-program computing hardware.",
    educationalLore: "Charles Babbage designed the Analytical Engine, incorporating an Arithmetic Logic Unit (the Mill), internal memory (the Store), conditional branching, and punched-card input. Although never completed in his lifetime due to machining tolerances, it is recognized as the first general-purpose computer design.",
    citation: "Babbage, C. (1837). On the Mathematical Powers of the Calculating Engine.",
    effects: {
      generatorBonus: { generatorId: "gen_difference_engine", factor: 3.0 },
      description: "Babbage Difference Engines produce +200% more Insights."
    }
  },
  {
    id: "ms_lovelace_algorithm",
    eraId: 2,
    title: "Ada Lovelace's Note G Algorithm",
    year: "1843",
    cost: 1000000,
    prerequisites: ["ms_analytical_engine"],
    quoteOrFigure: "Ada Lovelace",
    paradigmShift: "The transition from arithmetic to general symbolic software, and the publication of the first computer program.",
    educationalLore: "Translating Menabrea's paper on Babbage's engine, Ada Lovelace added extensive notes. In 'Note G', she wrote an algorithm to compute Bernoulli numbers on the machine and made the prophetic observation that the engine might compose music, graphics, and scientific symbols if rules could be expressed.",
    citation: "Lovelace, A. A. (1843). Sketch of the Analytical Engine Invented by Charles Babbage.",
    effects: {
      globalMultiplier: 2.5,
      clickMultiplier: 2.0,
      description: "Increases global Insight generation by +150% and doubles click power."
    }
  },

  // ERA 3 BREAKTHROUGHS
  {
    id: "ms_turing_machine",
    eraId: 3,
    title: "Universal Turing Machine",
    year: "1936",
    cost: 3500000,
    prerequisites: ["ms_lovelace_algorithm"],
    quoteOrFigure: "Alan Turing",
    paradigmShift: "Proved that a single universal machine can compute any mathematically algorithmic function.",
    educationalLore: "In 'On Computable Numbers', Alan Turing formulated an abstract machine that reads, modifies, and moves along an infinite tape of symbols. This fundamental theorem established the theoretical bounds of computability and the architecture of modern digital computation.",
    citation: "Turing, A. M. (1936). On Computable Numbers, with an Application to the Entscheidungsproblem.",
    effects: {
      generatorBonus: { generatorId: "gen_relay_computer", factor: 2.5 },
      globalMultiplier: 2.0,
      description: "Doubles global rate and boosts Relay Computers by +150%."
    }
  },
  {
    id: "ms_mcculloch_pitts",
    eraId: 3,
    title: "McCulloch-Pitts Artificial Neuron",
    year: "1943",
    cost: 15000000,
    prerequisites: ["ms_turing_machine"],
    quoteOrFigure: "Warren McCulloch & Walter Pitts",
    paradigmShift: "Mathematical proof that networks of idealized biological neurons can compute arbitrary logical functions.",
    educationalLore: "Neurophysiologist Warren McCulloch and logician Walter Pitts published a threshold logic model of biological neurons. By showing that interconnected binary neurons could compute ANY logical statement (AND, OR, NOT), they sparked the connectionist paradigm of neural computation.",
    citation: "McCulloch, W. S., & Pitts, W. (1943). A Logical Calculus of the Ideas Immanent in Nervous Activity.",
    effects: {
      generatorBonus: { generatorId: "gen_vacuum_tube", factor: 3.0 },
      description: "Vacuum Tube Banks produce +200% more Insights."
    }
  },
  {
    id: "ms_turing_test",
    eraId: 3,
    title: "The Imitation Game (Turing Test)",
    year: "1950",
    cost: 60000000,
    prerequisites: ["ms_mcculloch_pitts"],
    quoteOrFigure: "Alan Turing",
    paradigmShift: "Operationalized the metaphysical question 'Can machines think?' into an empirical behavioral benchmark.",
    educationalLore: "In 'Computing Machinery and Intelligence', Turing proposed an operational test: if a human interrogator cannot distinguish text responses of a computer from a human, the machine can be deemed to exhibit intelligent behavior.",
    citation: "Turing, A. M. (1950). Computing Machinery and Intelligence. Mind, 59(236), 433-460.",
    effects: {
      clickMultiplier: 3.0,
      description: "Triples active Think Insight yield."
    }
  },
  {
    id: "ms_dartmouth_1956",
    eraId: 3,
    title: "Dartmouth Summer Research Workshop",
    year: "1956",
    cost: 250000000,
    prerequisites: ["ms_turing_test"],
    quoteOrFigure: "John McCarthy, Marvin Minsky, Claude Shannon, Nathaniel Rochester",
    paradigmShift: "Coined the term 'Artificial Intelligence' and founded it as a distinct scientific academic discipline.",
    educationalLore: "A two-month workshop at Dartmouth College organized by John McCarthy formally established the field. The foundational proposal declared that 'every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.'",
    citation: "McCarthy, J., Minsky, M. L., Rochester, N., & Shannon, C. E. (1955). A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence.",
    effects: {
      globalMultiplier: 3.0,
      description: "Triples all Insight generation across the entire system."
    }
  },

  // ERA 4 BREAKTHROUGHS
  {
    id: "ms_logic_theorist",
    eraId: 4,
    title: "Logic Theorist & Heuristic Search",
    year: "1956",
    cost: 800000000,
    prerequisites: ["ms_dartmouth_1956"],
    quoteOrFigure: "Allen Newell, Herbert Simon, Cliff Shaw",
    paradigmShift: "First automated theorem prover using heuristic search trees to prove complex mathematical propositions.",
    educationalLore: "Considered the first functioning AI program, Logic Theorist proved 38 of the first 52 theorems in Whitehead and Russell's Principia Mathematica, even discovering a proof for Theorem 2.85 that was shorter and more elegant than the authors' original work.",
    citation: "Newell, A., & Simon, H. A. (1956). The Logic Theory Machine: A Complex Information Processing System.",
    effects: {
      generatorBonus: { generatorId: "gen_lisp_machine", factor: 2.5 },
      description: "LISP Workstations produce +150% more Insights."
    }
  },
  {
    id: "ms_eliza",
    eraId: 4,
    title: "ELIZA Natural Language System",
    year: "1966",
    cost: 3000000000,
    prerequisites: ["ms_logic_theorist"],
    quoteOrFigure: "Joseph Weizenbaum (MIT)",
    paradigmShift: "Demonstrated keyword pattern matching and exposed the human tendency to project consciousness onto shallow syntax.",
    educationalLore: "Weizenbaum created ELIZA (most famously the DOCTOR script), which simulated a Rogerian psychotherapist by reflecting user input back as questions. Its convincing illusion of empathy led to the coining of the 'ELIZA Effect'—anthropomorphizing automated responses.",
    citation: "Weizenbaum, J. (1966). ELIZA—A Computer Program For the Study of Natural Language Communication Between Man and Machine.",
    effects: {
      clickMultiplier: 2.5,
      description: "Active Think yield increased by +150%."
    }
  },
  {
    id: "ms_expert_systems",
    eraId: 4,
    title: "Expert Systems & Knowledge Engineering",
    year: "1975",
    cost: 15000000000,
    prerequisites: ["ms_eliza"],
    quoteOrFigure: "Edward Feigenbaum (Stanford)",
    paradigmShift: "Commercialization of rule-based inference engines separated from declarative domain knowledge bases.",
    educationalLore: "Systems like MYCIN (infectious disease diagnosis) and DENDRAL proved that high-performance domain expertise could be captured through hundreds of specialized IF-THEN production rules, triggering commercial enterprise AI adoption.",
    citation: "Shortliffe, E. H. (1976). Computer-Based Medical Consultations: MYCIN. Elsevier.",
    effects: {
      generatorBonus: { generatorId: "gen_rule_engine", factor: 3.0 },
      description: "Production Rule Engines produce +200% more Insights."
    }
  },
  {
    id: "ms_ai_winter_survival",
    eraId: 4,
    title: "Navigating the First AI Winter",
    year: "1980s",
    cost: 75000000000,
    prerequisites: ["ms_expert_systems"],
    quoteOrFigure: "Sir James Lighthill & AI Research Community",
    paradigmShift: "Recognized the fragility of hand-crafted rules and combinatorial explosion in unstructured real-world domains.",
    educationalLore: "When early symbolic systems failed to scale to real-world ambiguity and common sense, research funding collapsed (the AI Winter). This crucible forced researchers to abandon brittle heuristics in favor of principled probabilistic and statistical learning paradigms.",
    citation: "Lighthill, J. (1973). Artificial Intelligence: A General Survey (The Lighthill Report). Science Research Council.",
    effects: {
      globalMultiplier: 2.5,
      description: "Increases global Insight production by +150%."
    }
  },

  // ERA 5 BREAKTHROUGHS
  {
    id: "ms_backprop_revival",
    eraId: 5,
    title: "Backpropagation Rediscovery",
    year: "1986",
    cost: 250000000000,
    prerequisites: ["ms_ai_winter_survival"],
    quoteOrFigure: "David Rumelhart, Geoffrey Hinton, Ronald Williams",
    paradigmShift: "Solved the credit assignment problem, allowing multi-layer neural networks to learn internal representations.",
    educationalLore: "By propagating error derivatives backwards through network layers via the calculus chain rule, Rumelhart, Hinton, and Williams proved that hidden layers could automatically discover useful feature representations, reviving neural network connectionism from its two-decade slumber.",
    citation: "Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature, 323(6088), 533-536.",
    effects: {
      generatorBonus: { generatorId: "gen_backprop_rig", factor: 3.0 },
      globalMultiplier: 2.0,
      description: "Doubles global rate and boosts Backpropagation Rigs by +200%."
    }
  },
  {
    id: "ms_support_vector_machines",
    eraId: 5,
    title: "Support Vector Machines & Kernel Trick",
    year: "1995",
    cost: 1000000000000,
    prerequisites: ["ms_backprop_revival"],
    quoteOrFigure: "Corinna Cortes & Vladimir Vapnik",
    paradigmShift: "Introduced convex optimization and maximum-margin hyperplanes with rigorous generalization bounds.",
    educationalLore: "Cortes and Vapnik introduced Support Vector Machines (SVMs), which map input vectors into high-dimensional feature spaces via the 'kernel trick' to find maximum-margin separating hyperplanes, dominating machine learning throughout the late 1990s and 2000s.",
    citation: "Cortes, C., & Vapnik, V. (1995). Support-vector networks. Machine Learning, 20(3), 273-297.",
    effects: {
      generatorBonus: { generatorId: "gen_svm_kernel", factor: 3.0 },
      description: "Support Vector Kernel Clusters produce +200% more Insights."
    }
  },
  {
    id: "ms_deep_blue",
    eraId: 5,
    title: "Heuristic Search Mastery (1997)",
    year: "1997",
    cost: 4500000000000,
    prerequisites: ["ms_support_vector_machines"],
    quoteOrFigure: "Feng-hsiung Hsu, Murray Campbell, Thomas Anantharaman",
    paradigmShift: "Demonstrated that brute-force parallel hardware evaluating 200M positions/sec could beat human world champions.",
    educationalLore: "In May 1997, IBM's Deep Blue defeated World Chess Champion Garry Kasparov in a six-game match (3.5–2.5). The system combined custom VLSI chess chips with deep alpha-beta tree search and expert-tuned positional evaluation heuristics.",
    citation: "Campbell, M., Hoane, A. J., & Hsu, F. H. (2002). Deep Blue. Artificial Intelligence, 134(1-2), 57-83.",
    effects: {
      clickMultiplier: 3.0,
      description: "Triples active Think click power."
    }
  },
  {
    id: "ms_imagenet_inception",
    eraId: 5,
    title: "ImageNet & Open Benchmark Culture",
    year: "2009",
    cost: 20000000000000,
    prerequisites: ["ms_deep_blue"],
    quoteOrFigure: "Fei-Fei Li & ImageNet Research Team",
    paradigmShift: "Established that massive, high-quality annotated datasets are as crucial to intelligence as model architectures.",
    educationalLore: "Recognizing that machine learning models suffered from a lack of realistic training data, Fei-Fei Li and colleagues mapped over 14 million images to the WordNet hierarchy. The resulting annual competition (ILSVRC) catalyzed the modern deep learning revolution.",
    citation: "Deng, J. et al. (2009). ImageNet: A Large-Scale Hierarchical Image Database. IEEE CVPR.",
    effects: {
      globalMultiplier: 3.0,
      description: "Triples all Insight generation across the entire system."
    }
  },

  // ERA 6 BREAKTHROUGHS
  {
    id: "ms_alexnet",
    eraId: 6,
    title: "AlexNet & GPU Deep Learning",
    year: "2012",
    cost: 75000000000000,
    prerequisites: ["ms_imagenet_inception"],
    quoteOrFigure: "Alex Krizhevsky, Ilya Sutskever, Geoffrey Hinton",
    paradigmShift: "Conclusively proved the supremacy of deep convolutional neural networks trained on parallel GPUs over feature engineering.",
    educationalLore: "Trained on two consumer NVIDIA GTX 580 GPUs using ReLU activations, dropout regularization, and data augmentation, AlexNet halved the top-5 error rate on ImageNet (from 26% to 15.3%), igniting the worldwide deep learning boom.",
    citation: "Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet Classification with Deep Convolutional Neural Networks. NeurIPS.",
    effects: {
      generatorBonus: { generatorId: "gen_gpu_matrix_farm", factor: 4.0 },
      description: "Parallel GPU Farms produce +300% more Insights."
    }
  },
  {
    id: "ms_dqn_atari",
    eraId: 6,
    title: "Deep Q-Networks (DQN)",
    year: "2015",
    cost: 300000000000000,
    prerequisites: ["ms_alexnet"],
    quoteOrFigure: "Volodymyr Mnih et al. (DeepMind)",
    paradigmShift: "Unified deep neural representations with reinforcement learning to master complex visual environments from scratch.",
    educationalLore: "By stabilizing Q-learning with an experience replay buffer and target networks, DQN learned to play 49 different Atari 2600 games directly from raw pixel frames, reaching superhuman performance on majority of titles without hand-crafted features.",
    citation: "Mnih, V. et al. (2015). Human-level control through deep reinforcement learning. Nature, 518(7540), 529-533.",
    effects: {
      clickMultiplier: 3.5,
      description: "Active Think yield increased by +250%."
    }
  },
  {
    id: "ms_alphago",
    eraId: 6,
    title: "AlphaGo & Intuitive Monte Carlo Search",
    year: "2016",
    cost: 1500000000000000,
    prerequisites: ["ms_dqn_atari"],
    quoteOrFigure: "David Silver, Demis Hassabis et al. (DeepMind)",
    paradigmShift: "Mastered an intuitive board game with 10^170 possible states using neural policy/value nets and tree search.",
    educationalLore: "In March 2016, AlphaGo defeated 18-time world champion Go player Lee Sedol 4–1 in Seoul. By training policy networks to select promising moves and value networks to evaluate board positions within Monte Carlo Tree Search, it overcame a challenge previously thought decades away.",
    citation: "Silver, D. et al. (2016). Mastering the game of Go with deep neural networks and tree search. Nature, 529(7587), 484-489.",
    effects: {
      globalMultiplier: 3.0,
      description: "Triples all Insight generation across the entire system."
    }
  },
  {
    id: "ms_transformer_attention",
    eraId: 6,
    title: "Transformer Architecture (Attention Is All You Need)",
    year: "2017",
    cost: 8000000000000000,
    prerequisites: ["ms_alphago"],
    quoteOrFigure: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit et al.",
    paradigmShift: "Replaced recurrent sequential processing entirely with parallel Multi-Head Scaled Dot-Product Self-Attention.",
    educationalLore: "The Transformer architecture eliminated sequential recurrence (RNN/LSTM) in favor of self-attention mechanisms. By enabling end-to-end parallel computation over vast text corpora, it became the unified foundational backbone for virtually all modern Generative AI, LLMs, and multimodal models.",
    citation: "Vaswani, A. et al. (2017). Attention Is All You Need. NeurIPS 2017.",
    effects: {
      generatorBonus: { generatorId: "gen_attention_head", factor: 4.0 },
      globalMultiplier: 2.5,
      description: "Multi-Head Attention Clusters produce 4x; Global rate +150%."
    }
  },

  // ERA 7 BREAKTHROUGHS
  {
    id: "ms_rlhf_alignment",
    eraId: 7,
    title: "Instruction Tuning & RLHF Alignment",
    year: "2022",
    cost: 40000000000000000,
    prerequisites: ["ms_transformer_attention"],
    quoteOrFigure: "Long Ouyang, Jeffrey Wu, Paul Christiano et al.",
    paradigmShift: "Aligned raw autoregressive next-token predictors into helpful, cooperative, and safe interactive conversational partners.",
    educationalLore: "By combining supervised fine-tuning on demonstrations with Reinforcement Learning from Human Feedback (RLHF) using PPO, researchers transformed raw foundation models into cooperative, conversational assistants capable of nuanced intent following.",
    citation: "Ouyang, L. et al. (2022). Training language models to follow instructions with human feedback. NeurIPS.",
    effects: {
      clickMultiplier: 4.0,
      description: "Active Think yield multiplied by 4x."
    }
  },
  {
    id: "ms_chain_of_thought",
    eraId: 7,
    title: "Chain-of-Thought & Test-Time Compute",
    year: "2022–2024",
    cost: 200000000000000000,
    prerequisites: ["ms_rlhf_alignment"],
    quoteOrFigure: "Jason Wei, Xuezhi Wang, Dale Schuurmans et al.",
    paradigmShift: "Discovered that allocating inference-time deliberation compute allows models to reason step-by-step through complex logic.",
    educationalLore: "Eliciting structured intermediate reasoning paths ('thinking step by step') dramatically boosted symbolic logic, arithmetic, and code synthesis. Scaling inference-time deliberation proved that compute spent during response generation unlocks new reasoning capabilities.",
    citation: "Wei, J. et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS.",
    effects: {
      generatorBonus: { generatorId: "gen_reasoning_loop", factor: 4.0 },
      description: "Deliberative Reasoning Engines produce +300% more Insights."
    }
  },
  {
    id: "ms_tool_augmented_mcp",
    eraId: 7,
    title: "Tool Augmentation & Model Context Protocols",
    year: "2023–2024",
    cost: 1000000000000000000,
    prerequisites: ["ms_chain_of_thought"],
    quoteOrFigure: "Frontier AI Research & Open Source Community",
    paradigmShift: "Grounded neural generation in real-world deterministic tools, code execution environments, and standardized context protocols.",
    educationalLore: "Equipping neural models with function calling, sandboxed code interpreters, and standardized context protocols (like Model Context Protocol) bridges inductive neural intuition with deductive symbolic verification and dynamic external world interaction.",
    citation: "Schick, T. et al. (2023). Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS.",
    effects: {
      generatorBonus: { generatorId: "gen_agent_swarm", factor: 4.0 },
      globalMultiplier: 3.0,
      description: "Tool-Augmented Agent Swarms produce 4x; Global rate tripled."
    }
  },
  {
    id: "ms_autonomous_agent_swarms",
    eraId: 7,
    title: "Autonomous Multi-Agent Orchestration",
    year: "2024–Present",
    cost: 5000000000000000000,
    prerequisites: ["ms_tool_augmented_mcp"],
    quoteOrFigure: "Autonomous Agent Researchers & Systems Architects",
    paradigmShift: "Self-reflective agent loops and coordinated swarms solving long-horizon scientific, mathematical, and software challenges.",
    educationalLore: "Modern AI architecture coordinates specialized autonomous subagents equipped with memory, planning, and self-critique loops. These cooperative swarms tackle multi-day software engineering and scientific discovery tasks autonomously, marking the threshold of true synthetic collaboration.",
    citation: "Wang, G. et al. (2023). Voyager: An Open-Ended Embodied Agent with Large Language Models. arXiv:2305.16291.",
    effects: {
      globalMultiplier: 5.0,
      description: "Global Insight production multiplied by 5x! Era 7 Singularity achieved!"
    }
  }
];
