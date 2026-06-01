// POINTS maps each difficulty level to a base score value.
// These are the raw points BEFORE the combo multiplier is applied.
export const POINTS = { easy: 10, medium: 20, hard: 30 };

// Each question object must have:
//   id         – unique number used to match results back to questions
//   category   – displayed on the question card and in the results breakdown
//   difficulty – "easy" | "medium" | "hard" (controls base points)
//   text       – the question shown to the user
//   answers    – array of { id, text } objects (2–4 items)
//   correctId  – must match one of the answer ids
//   explanation– shown after the user answers
export const questions = [
  {
    id: 1,
    category: "Science",
    difficulty: "easy",
    text: "What is the chemical symbol for water?",
    answers: [
      { id: "a", text: "H₂O" },
      { id: "b", text: "CO₂" },
      { id: "c", text: "NaCl" },
      { id: "d", text: "O₂" },
    ],
    correctId: "a",
    explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom — hence H₂O.",
  },
  {
    id: 2,
    category: "Geography",
    difficulty: "easy",
    text: "Which is the largest ocean on Earth?",
    answers: [
      { id: "a", text: "Atlantic" },
      { id: "b", text: "Indian" },
      { id: "c", text: "Arctic" },
      { id: "d", text: "Pacific" },
    ],
    correctId: "d",
    explanation: "The Pacific Ocean covers over 165 million km² — larger than all land masses combined.",
  },
  {
    id: 3,
    category: "History",
    difficulty: "medium",
    text: "In which year did World War II end?",
    answers: [
      { id: "a", text: "1943" },
      { id: "b", text: "1945" },
      { id: "c", text: "1947" },
      { id: "d", text: "1939" },
    ],
    correctId: "b",
    explanation: "WWII ended in 1945: Germany surrendered in May, Japan in September after the atomic bombings.",
  },
  {
    id: 4,
    category: "Mathematics",
    difficulty: "easy",
    text: "What is the value of π (pi) to two decimal places?",
    answers: [
      { id: "a", text: "3.14" },
      { id: "b", text: "3.16" },
      { id: "c", text: "3.12" },
      { id: "d", text: "3.18" },
    ],
    correctId: "a",
    explanation: "Pi (π) is approximately 3.14159…, commonly rounded to 3.14 for general use.",
  },
  {
    id: 5,
    category: "Technology",
    difficulty: "easy",
    text: "What does 'HTML' stand for?",
    answers: [
      { id: "a", text: "Hyper Text Markup Language" },
      { id: "b", text: "High Tech Modern Language" },
      { id: "c", text: "Hyper Transfer Markup Logic" },
      { id: "d", text: "Home Tool Markup Language" },
    ],
    correctId: "a",
    explanation: "HTML (HyperText Markup Language) is the standard language for structuring web pages.",
  },
  {
    id: 6,
    category: "Science",
    difficulty: "medium",
    text: "How many bones are in the adult human body?",
    answers: [
      { id: "a", text: "186" },
      { id: "b", text: "206" },
      { id: "c", text: "216" },
      { id: "d", text: "196" },
    ],
    correctId: "b",
    explanation: "Adults have 206 bones. Babies are born with ~270, which gradually fuse as they grow.",
  },
  {
    id: 7,
    category: "Geography",
    difficulty: "medium",
    text: "What is the capital city of Australia?",
    answers: [
      { id: "a", text: "Sydney" },
      { id: "b", text: "Melbourne" },
      { id: "c", text: "Canberra" },
      { id: "d", text: "Brisbane" },
    ],
    correctId: "c",
    explanation: "Canberra is Australia's capital — chosen as a compromise between rivals Sydney and Melbourne.",
  },
  {
    id: 8,
    category: "Technology",
    difficulty: "hard",
    text: "Which data structure uses LIFO (Last In, First Out) order?",
    answers: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Linked List" },
      { id: "c", text: "Stack" },
      { id: "d", text: "Tree" },
    ],
    correctId: "c",
    explanation: "A Stack follows LIFO — the last element pushed is the first to be popped, like a stack of plates.",
  },
];
