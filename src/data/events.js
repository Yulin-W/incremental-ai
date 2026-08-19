/**
 * events.js
 * Paradox-style historical narrative epoch advance popups and Singularity event definitions.
 */

export const EPOCH_EVENTS = {
  1: {
    id: "epoch_1_event",
    epochId: 1,
    eraId: 1,
    category: "Historical Epoch Advancement",
    epochNumber: 1,
    title: "Epoch 1: Antiquity & Mechanical Automata",
    subtitle: "The Philosophical & Mechanical Roots of Artificial Life (Prehistory – 1500s)",
    icon: "📜",
    narrative: "In ancient workshops and classical academies, humanity first dreams of artificial autonomy. From the bronze guardian Talos crafted by Hephaestus to Heron of Alexandria's programmable puppet theatres and Ramon Llull's combinatorial paper wheels, the foundational intuition takes root: physical matter and formal symbols can be orchestrated to imitate reason.",
    quote: {
      text: "For if every instrument could accomplish its own work, obeying or anticipating the will of others... chief-workmen would not want assistants, nor masters slaves.",
      author: "Aristotle, Politics (c. 350 BCE)"
    },
    buttonText: "Forge the first automata of reason! →"
  },
  2: {
    id: "epoch_2_event",
    epochId: 2,
    eraId: 2,
    category: "Historical Epoch Advancement",
    epochNumber: 2,
    title: "Epoch 2: Formal Logic & Mechanical Calculators",
    subtitle: "The Mechanization of Arithmetic and Symbolic Computation (1600s – 1800s)",
    icon: "⚙️",
    narrative: "The Enlightenment dawns with a revolution in mechanical calculation. Blaise Pascal crafts geared arithmetic boxes to tally taxes, while Gottfried Wilhelm Leibniz develops binary arithmetic and dreams of a universal calculus to resolve human debate. Charles Babbage and Ada Lovelace conceive the first general-purpose stored-program computer—realizing that machines can process not just numbers, but arbitrary symbols and melodies.",
    quote: {
      text: "When a dispute arises, there will be no more need for disputation between two philosophers than between two accountants. It will be enough for them to take their pens in hand and say: Calculemus!",
      author: "Gottfried Wilhelm Leibniz, De Arte Combinatoria (1679)"
    },
    buttonText: "Calculemus! Let us calculate. →"
  },
  3: {
    id: "epoch_3_event",
    epochId: 3,
    eraId: 3,
    category: "Historical Epoch Advancement",
    epochNumber: 3,
    title: "Epoch 3: Birth of Computing & Cybernetics",
    subtitle: "Electronic Brains, Biological Neurons & Theoretical Limits (1930s – 1950s)",
    icon: "💡",
    narrative: "Amidst theoretical mathematics and wartime cryptographic breakthroughs, Alan Turing defines universal computability and breaks ciphers with parallel electromechanical Bombes. Warren McCulloch and Walter Pitts prove that interconnected binary neurons compute arbitrary logical propositions. In 1956, a visionary summer workshop at Dartmouth College coins an audacious new discipline: Artificial Intelligence.",
    quote: {
      text: "We may hope that machines will eventually compete with men in all purely intellectual fields... Can machines think?",
      author: "Alan Turing, Computing Machinery and Intelligence (1950)"
    },
    buttonText: "The electronic brain awakens. Onward! →"
  },
  4: {
    id: "epoch_4_event",
    epochId: 4,
    eraId: 4,
    category: "Historical Epoch Advancement",
    epochNumber: 4,
    title: "Epoch 4: Symbolic AI & Knowledge Systems",
    subtitle: "Heuristic Search, Expert Rules & The First AI Winters (1960s – 1980s)",
    icon: "🖥️",
    narrative: "The golden age of Good Old-Fashioned AI (GOFAI) seeks to conquer cognition through explicit symbolic manipulation. Researchers construct heuristic search engines like Logic Theorist, chatbot illusions like ELIZA, and industrial Expert Systems powered by thousands of IF-THEN production rules. Yet as hand-crafted heuristics collide with real-world ambiguity, research funding freezes in the cold crucible of the AI Winter.",
    quote: {
      text: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.",
      author: "Edsger W. Dijkstra (1984)"
    },
    buttonText: "Codify the rules of human expertise. →"
  },
  5: {
    id: "epoch_5_event",
    epochId: 5,
    eraId: 5,
    category: "Historical Epoch Advancement",
    epochNumber: 5,
    title: "Epoch 5: Statistical Learning & Neural Resurgence",
    subtitle: "From Deductive Rules to Inductive Data-Driven Learning (1990s – 2000s)",
    icon: "📈",
    narrative: "AI undergoes a profound paradigm shift: abandoning rigid top-down rules in favor of bottom-up statistical induction. The backpropagation algorithm solves credit assignment across multi-layer neural networks, Support Vector Machines achieve convex maximum-margin bounds, and IBM's Deep Blue defeats Garry Kasparov. Fei-Fei Li's ImageNet establishes massive benchmark datasets as the true fuel of machine intelligence.",
    quote: {
      text: "A breakthrough in machine learning would be worth ten Microsofts.",
      author: "Bill Gates, Speech at University of Washington (2004)"
    },
    buttonText: "Let the gradients descend! →"
  },
  6: {
    id: "epoch_6_event",
    epochId: 6,
    eraId: 6,
    category: "Historical Epoch Advancement",
    epochNumber: 6,
    title: "Epoch 6: Deep Learning & Transformers",
    subtitle: "GPU Acceleration, Deep Representations & Scaled Self-Attention (2010s – 2020)",
    icon: "✨",
    narrative: "The convergence of GPU parallel compute, massive internet datasets, and deep convolutional networks ignites the modern AI explosion. AlexNet shatters computer vision records, DeepMind's AlphaGo masters an intuitive ancient game with 10^170 states, and the landmark paper 'Attention Is All You Need' replaces sequential recurrence with parallel multi-head self-attention, establishing the unified foundation for modern generative intelligence.",
    quote: {
      text: "Deep Learning is going to be able to do everything.",
      author: "Geoffrey Hinton, Turing Award Laureate"
    },
    buttonText: "Attention is all we need. Scale up! →"
  },
  7: {
    id: "epoch_7_event",
    epochId: 7,
    eraId: 7,
    category: "Historical Epoch Advancement",
    epochNumber: 7,
    title: "Epoch 7: Autonomous Agents & Frontier Models",
    subtitle: "Deliberative Reasoning, Tool-Use & Multi-Agent Swarms (2020s – Present)",
    icon: "🤖",
    narrative: "Foundation models transcend passive text completion through reinforcement learning from human feedback (RLHF), chain-of-thought test-time compute, and dynamic tool orchestration. Collaborative autonomous multi-agent networks operate compilers, terminal shells, and scientific workflows—bridging probabilistic intuition with deterministic verification at the dawn of synthetic discovery.",
    quote: {
      text: "The ultimate goal of AI is not merely to predict the next token, but to reason, act, discover, and collaborate autonomously.",
      author: "Frontier AI Systems Architecture (2024)"
    },
    buttonText: "Step-by-step into the frontier singularity! 🚀"
  }
};

export const ERA_EVENTS = EPOCH_EVENTS; // Backward compatibility alias

export const SINGULARITY_EVENT = {
  id: "singularity_event",
  category: "Technological Singularity Reached",
  title: "Epoch 7 Frontier Singularity Achieved!",
  subtitle: "You have traversed the entire history of Artificial Intelligence (Prehistory – Present Day)",
  icon: "🌌",
  narrative: "Humanity's journey through reasoning automata, mechanical calculus, electronic cybernetics, symbolic expert systems, statistical backpropagation, and multi-agent foundation models has culminated in synthetic agency. You have unlocked all historical milestones!",
  quote: {
    text: "The future is already here — it's just not evenly distributed.",
    author: "William Gibson"
  }
};
