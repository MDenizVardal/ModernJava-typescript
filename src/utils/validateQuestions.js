const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

/**
 * Validates and normalises a raw parsed value into the question shape the quiz expects.
 * Throws a descriptive Error on any problem so the UI can surface it directly.
 */
export function validateQuestions(raw) {
  if (!Array.isArray(raw))
    throw new Error("Expected a JSON array at the top level (e.g. [ { … }, { … } ]).");
  if (raw.length === 0)
    throw new Error("The array is empty — add at least one question.");
  if (raw.length > 50)
    throw new Error("Maximum 50 questions allowed per quiz.");

  return raw.map((q, i) => {
    const n = i + 1;

    if (typeof q !== "object" || q === null)
      throw new Error(`Question ${n} is not an object.`);
    if (typeof q.text !== "string" || !q.text.trim())
      throw new Error(`Question ${n}: "text" field is required and must be a non-empty string.`);
    if (!Array.isArray(q.answers) || q.answers.length < 2)
      throw new Error(`Question ${n}: "answers" must be an array with at least 2 items.`);
    if (q.answers.length > 4)
      throw new Error(`Question ${n}: "answers" can have at most 4 items.`);

    const seenIds = new Set();
    const answers = q.answers.map((a, j) => {
      if (!a?.id)
        throw new Error(`Question ${n}, answer ${j + 1}: "id" is required.`);
      const id = String(a.id);
      if (seenIds.has(id))
        throw new Error(`Question ${n}: duplicate answer id "${id}".`);
      seenIds.add(id);
      if (typeof a.text !== "string" || !a.text.trim())
        throw new Error(`Question ${n}, answer ${j + 1}: "text" is required.`);
      return { id, text: a.text.trim() };
    });

    if (!q.correctId)
      throw new Error(`Question ${n}: "correctId" is required.`);
    const correctId = String(q.correctId);
    if (!seenIds.has(correctId))
      throw new Error(`Question ${n}: correctId "${correctId}" does not match any answer id.`);

    return {
      id:          q.id ?? n,
      category:    typeof q.category === "string" && q.category.trim() ? q.category.trim() : "General",
      difficulty:  VALID_DIFFICULTIES.has(q.difficulty) ? q.difficulty : "medium",
      text:        q.text.trim(),
      answers,
      correctId,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
    };
  });
}
