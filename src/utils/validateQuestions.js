// All difficulty values the quiz understands.
// Any other string will be silently replaced with "medium".
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

// Validates and normalises a raw parsed value (from JSON paste or URL fetch)
// into the exact question shape the quiz expects.
// Throws a descriptive Error on any problem so the UI can show it directly.
export function validateQuestions(raw) {
  // The top-level value must be an array, not an object or primitive.
  if (!Array.isArray(raw))
    throw new Error("Expected a JSON array at the top level (e.g. [ { … }, { … } ]).");

  // Prevent empty or oversized sets from reaching the quiz.
  if (raw.length === 0)
    throw new Error("The array is empty — add at least one question.");
  if (raw.length > 50)
    throw new Error("Maximum 50 questions allowed per quiz.");

  // Map over every item, validate it, and return a clean normalised copy.
  return raw.map((q, i) => {
    const n = i + 1; // human-readable question number for error messages

    if (typeof q !== "object" || q === null)
      throw new Error(`Question ${n} is not an object.`);

    // "text" is the question string shown to the user – it must exist.
    if (typeof q.text !== "string" || !q.text.trim())
      throw new Error(`Question ${n}: "text" field is required and must be a non-empty string.`);

    // Need at least 2 options to make a choice meaningful; cap at 4 for layout.
    if (!Array.isArray(q.answers) || q.answers.length < 2)
      throw new Error(`Question ${n}: "answers" must be an array with at least 2 items.`);
    if (q.answers.length > 4)
      throw new Error(`Question ${n}: "answers" can have at most 4 items.`);

    // Validate each answer and collect all ids for the correctId check below.
    const seenIds = new Set();
    const answers = q.answers.map((a, j) => {
      if (!a?.id)
        throw new Error(`Question ${n}, answer ${j + 1}: "id" is required.`);
      const id = String(a.id); // normalise to string so "1" and 1 are equivalent
      if (seenIds.has(id))
        throw new Error(`Question ${n}: duplicate answer id "${id}".`);
      seenIds.add(id);
      if (typeof a.text !== "string" || !a.text.trim())
        throw new Error(`Question ${n}, answer ${j + 1}: "text" is required.`);
      return { id, text: a.text.trim() };
    });

    // correctId must point to one of the answer ids we just collected.
    if (!q.correctId)
      throw new Error(`Question ${n}: "correctId" is required.`);
    const correctId = String(q.correctId);
    if (!seenIds.has(correctId))
      throw new Error(`Question ${n}: correctId "${correctId}" does not match any answer id.`);

    // Return a clean object with defaults filled in for optional fields.
    return {
      id:          q.id ?? n,             // fall back to array position if no id given
      category:    typeof q.category === "string" && q.category.trim() ? q.category.trim() : "General",
      difficulty:  VALID_DIFFICULTIES.has(q.difficulty) ? q.difficulty : "medium",
      text:        q.text.trim(),
      answers,
      correctId,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
    };
  });
}
