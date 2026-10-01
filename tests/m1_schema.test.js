import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestions, validateState } from '../src/schema.js';

test('M1: validateState accepts valid string or dict', () => {
  assert.equal(validateState("Hello world"), true);
  assert.equal(validateState({ body: "Test message", user: "alice" }), true);
  assert.throws(() => validateState(null), /Invalid state/);
  assert.throws(() => validateState(""), /Empty state/);
});

test('M1: validateQuestions accepts choice, score, and noul', () => {
  const validQuestions = {
    dept: {
      type: "choice",
      instructions: "Pick department",
      criteria: { billing: "refunds", tech: "bugs" }
    },
    urgency: {
      type: "score",
      instructions: "Urgency scale",
      criteria: ["low", "medium", "critical"]
    },
    churn: {
      type: "noul",
      instructions: "Threatens to leave"
    }
  };

  assert.equal(validateQuestions(validQuestions), true);
});

test('M1: validateQuestions rejects invalid question type', () => {
  assert.throws(() => validateQuestions({ q: { type: "free_text" } }), /Unsupported question type/);
});
