/**
 * Schema and validation for Laya state and typed questions.
 */

export function validateState(state) {
  if (state === null || state === undefined) {
    throw new Error('Invalid state: state must not be null or undefined');
  }
  if (typeof state === 'string') {
    if (state.trim().length === 0) {
      throw new Error('Empty state: state string cannot be empty');
    }
    return true;
  }
  if (typeof state === 'object') {
    if (Object.keys(state).length === 0) {
      throw new Error('Empty state: state object cannot be empty');
    }
    return true;
  }
  throw new Error('Invalid state: state must be a string or dictionary');
}

export function validateQuestions(questions) {
  if (!questions || typeof questions !== 'object') {
    throw new Error('Questions must be a non-empty dictionary');
  }
  const entries = Object.entries(questions);
  if (entries.length === 0) {
    throw new Error('Questions must contain at least one question');
  }

  for (const [qid, q] of entries) {
    if (!q || typeof q !== 'object') {
      throw new Error(`Question "${qid}" must be an object`);
    }
    const type = q.type;
    if (type !== 'choice' && type !== 'score' && type !== 'noul') {
      throw new Error(`Unsupported question type "${type}" for "${qid}". Expected choice, score, or noul.`);
    }

    if (type === 'choice') {
      if (!q.criteria || typeof q.criteria !== 'object' || Array.isArray(q.criteria)) {
        throw new Error(`Choice question "${qid}" must have a criteria object mapping options to descriptions`);
      }
      if (Object.keys(q.criteria).length < 2) {
        throw new Error(`Choice question "${qid}" must have at least 2 options`);
      }
    } else if (type === 'score') {
      if (!Array.isArray(q.criteria) || q.criteria.length < 2) {
        throw new Error(`Score question "${qid}" must have an array of at least 2 criteria levels`);
      }
    }
  }

  return true;
}
