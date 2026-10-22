# JavaScript Quiz App

A multiple-choice quiz game built with React and Vite, with a streak-based combo multiplier and support for custom question sets.

## Features

- **Difficulty-based scoring**: easy, medium and hard questions are worth 10, 20 and 30 points
- **Combo multiplier**: each correct answer in a row raises the multiplier (1× → 1.5× → 2× → 2.5× → 3×); a wrong answer resets it
- **Instant feedback** with an explanation after every answer
- **Results screen**: score, points, per-category breakdown and a review of every question
- **Custom questions**: paste a JSON array or load one from a URL, validated before the quiz starts (max 50 questions)

## Tech stack

React 18, Vite, plain CSS. No other runtime dependencies.

## Project structure

```
src/
├── App.jsx              quiz state and screen transitions
├── components/          WelcomeScreen, QuizScreen, ResultsScreen, QuestionLoader, …
├── data/questions.js    built-in question set
└── utils/
    ├── scoring.js            combo multiplier rules
    └── validateQuestions.js  checks custom question JSON
```

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
```

## Custom question format

```json
[
  {
    "text": "Which keyword declares a block-scoped variable?",
    "answers": [
      { "id": "a", "text": "var" },
      { "id": "b", "text": "let" }
    ],
    "correctId": "b",
    "category": "Technology",
    "difficulty": "easy",
    "explanation": "let is block-scoped; var is function-scoped."
  }
]
```

`text`, `answers` (2–4) and `correctId` are required. `difficulty` sets the base points: easy 10, medium 20, hard 30.
