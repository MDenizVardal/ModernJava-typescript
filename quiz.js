const questions = [
  {
    category: "Science",
    text: "What is the chemical symbol for water?",
    answers: ["H₂O", "CO₂", "NaCl", "O₂"],
    correct: 0,
  },
  {
    category: "Geography",
    text: "Which is the largest ocean on Earth?",
    answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3,
  },
  {
    category: "History",
    text: "In which year did World War II end?",
    answers: ["1943", "1945", "1947", "1939"],
    correct: 1,
  },
  {
    category: "Mathematics",
    text: "What is the value of π (pi) to two decimal places?",
    answers: ["3.14", "3.16", "3.12", "3.18"],
    correct: 0,
  },
  {
    category: "Technology",
    text: "What does 'HTML' stand for?",
    answers: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Logic",
      "Home Tool Markup Language",
    ],
    correct: 0,
  },
];

let currentIndex = 0;
let score = 0;
let answered = false;

const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const questionCategory = document.getElementById("question-category");
const questionText = document.getElementById("question-text");
const answersGrid = document.getElementById("answers-grid");
const btnNext = document.getElementById("btn-next");
const quizContainer = document.getElementById("quiz-container");
const resultsScreen = document.getElementById("results-screen");
const resultsScore = document.getElementById("results-score");
const resultsMessage = document.getElementById("results-message");
const resultsIcon = document.getElementById("results-icon");
const btnRestart = document.getElementById("btn-restart");

function loadQuestion(index) {
  answered = false;
  btnNext.disabled = true;

  const q = questions[index];
  const total = questions.length;

  progressBar.style.width = `${((index) / total) * 100}%`;
  progressLabel.textContent = `Question ${index + 1} of ${total}`;
  questionCategory.textContent = q.category;
  questionText.textContent = q.text;

  answersGrid.innerHTML = "";
  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.dataset.index = i;
    btn.textContent = ans;
    btn.addEventListener("click", () => selectAnswer(btn, i));
    answersGrid.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, selectedIndex) {
  if (answered) return;
  answered = true;

  const correctIndex = questions[currentIndex].correct;
  const allBtns = answersGrid.querySelectorAll(".answer-btn");

  allBtns.forEach((btn) => (btn.disabled = true));

  if (selectedIndex === correctIndex) {
    score++;
    selectedBtn.classList.add("correct");
  } else {
    selectedBtn.classList.add("wrong");
    allBtns[correctIndex].classList.add("correct");
  }

  btnNext.disabled = false;
}

function showResults() {
  quizContainer.classList.add("hidden");
  resultsScreen.classList.remove("hidden");

  const total = questions.length;
  const pct = (score / total) * 100;

  resultsScore.textContent = `You scored ${score} out of ${total}`;

  // Determine feedback based on percentage
  let icon, message;
  if (pct === 100) { icon = "🏆"; message = "Perfect score! Outstanding!"; }
  else if (pct >= 80) { icon = "🎉"; message = "Excellent work!"; }
  else if (pct >= 60) { icon = "👍"; message = "Good job! Keep it up."; }
  else if (pct >= 40) { icon = "📚"; message = "Not bad — keep studying!"; }
  else               { icon = "💪"; message = "Better luck next time!"; }

  resultsIcon.textContent = icon;
  resultsMessage.textContent = message;
  progressBar.style.width = "100%";
}

function restart() {
  currentIndex = 0;
  score = 0;
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
