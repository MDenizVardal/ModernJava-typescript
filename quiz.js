const questions = [
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

let currentIndex = 0;
let score = 0;
let answered = false;
const results = []; // each entry: { questionId, selectedId, correct }

const progressBar       = document.getElementById("progress-bar");
const progressLabel     = document.getElementById("progress-label");
const questionCategory  = document.getElementById("question-category");
const difficultyBadge   = document.getElementById("difficulty-badge");
const questionText      = document.getElementById("question-text");
const answersGrid       = document.getElementById("answers-grid");
const explanationPanel  = document.getElementById("explanation-panel");
const explanationText   = document.getElementById("explanation-text");
const btnNext           = document.getElementById("btn-next");
const quizContainer     = document.getElementById("quiz-container");
const resultsScreen     = document.getElementById("results-screen");
const resultsScore      = document.getElementById("results-score");
const resultsMessage    = document.getElementById("results-message");
const resultsIcon       = document.getElementById("results-icon");
const categoryBreakdown = document.getElementById("category-breakdown");
const btnRestart        = document.getElementById("btn-restart");

function loadQuestion(index) {
  answered = false;
  btnNext.disabled = true;
  explanationPanel.classList.add("hidden");

  const q = questions[index];
  progressBar.style.width = `${(index / questions.length) * 100}%`;
  progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
  questionCategory.textContent = q.category;
  questionText.textContent = q.text;
  difficultyBadge.textContent = q.difficulty;
  difficultyBadge.className = `difficulty-badge ${q.difficulty}`;

  renderAnswers(q);
}

// Creates one button per answer object and appends it to the grid
function renderAnswers(question) {
  answersGrid.innerHTML = "";
  question.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.dataset.id = answer.id;
    btn.textContent = answer.text;
    btn.addEventListener("click", () => selectAnswer(btn, answer.id, question));
    answersGrid.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, selectedId, question) {
  if (answered) return;
  answered = true;

  const isCorrect = selectedId === question.correctId;
  results.push({ questionId: question.id, selectedId, correct: isCorrect });
  if (isCorrect) score++;

  const allBtns = answersGrid.querySelectorAll(".answer-btn");
  allBtns.forEach((btn) => (btn.disabled = true));
  selectedBtn.classList.add(isCorrect ? "correct" : "wrong");

  if (!isCorrect) {
    const correctBtn = [...allBtns].find((btn) => btn.dataset.id === question.correctId);
    correctBtn.classList.add("correct");
  }

  explanationText.textContent = question.explanation;
  explanationPanel.classList.remove("hidden");
  btnNext.disabled = false;
}

function showResults() {
  quizContainer.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  progressBar.style.width = "100%";

  const pct = Math.round((score / questions.length) * 100);
  resultsScore.textContent = `You scored ${score} out of ${questions.length} (${pct}%)`;

  const thresholds = [
    { min: 100, icon: "🏆", message: "Perfect score! Outstanding!" },
    { min: 80,  icon: "🎉", message: "Excellent work!" },
    { min: 60,  icon: "👍", message: "Good job! Keep it up." },
    { min: 40,  icon: "📚", message: "Not bad — keep studying!" },
    { min: 0,   icon: "💪", message: "Better luck next time!" },
  ];
  const feedback = thresholds.find((t) => pct >= t.min);
  resultsIcon.textContent = feedback.icon;
  resultsMessage.textContent = feedback.message;

  // Group results by category using Array.filter() on the questions array
  const categories = [...new Set(questions.map((q) => q.category))];
  categoryBreakdown.innerHTML = "";
  categories.forEach((cat) => {
    const catQs = questions.filter((q) => q.category === cat);
    const catCorrect = results.filter(
      (r) => catQs.find((q) => q.id === r.questionId) && r.correct
    ).length;
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `<span>${cat}</span><span>${catCorrect} / ${catQs.length}</span>`;
    categoryBreakdown.appendChild(row);
  });
}

function restart() {
  currentIndex = 0;
  score = 0;
  results.length = 0;
  quizContainer.classList.remove("hidden");
  resultsScreen.classList.add("hidden");
  loadQuestion(0);
}

btnNext.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion(currentIndex);
  } else {
    showResults();
  }
});

btnRestart.addEventListener("click", restart);

loadQuestion(0);
