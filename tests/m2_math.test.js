import { test } from 'node:test';
import assert from 'node:assert/strict';
import { softmax, parseChoiceAnswer, parseScoreAnswer, parseNoulAnswer } from '../src/math.js';

test('M2: softmax sums to 1 and preserves rank', () => {
  const probs = softmax([2.0, 1.0, 0.1]);
  const sum = probs.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-5);
  assert.ok(probs[0] > probs[1]);
  assert.ok(probs[1] > probs[2]);
});

test('M2: parseChoiceAnswer extracts top choice and probabilities', () => {
  const options = ["billing", "tech", "sales"];
  const probs = [0.8, 0.15, 0.05];
  const ans = parseChoiceAnswer(options, probs);
  assert.equal(ans.choice, "billing");
  assert.equal(ans.probabilities["billing"], 0.8);
  assert.equal(ans.answer_confidence, 0.8);
});

test('M2: parseScoreAnswer computes expected continuous score', () => {
  const legend = ["low", "med", "high"];
  const probs = [0.1, 0.2, 0.7]; // expected: 0*0.1 + 1*0.2 + 2*0.7 = 1.6
  const ans = parseScoreAnswer(legend, probs);
  assert.equal(ans.score, 1.6);
  assert.equal(ans.answer_confidence, 0.7);
});

test('M2: parseNoulAnswer extracts boolean probability', () => {
  const probs = [0.15, 0.85]; // [P(false), P(true)]
  const ans = parseNoulAnswer(probs);
  assert.equal(ans.noul, 0.85);
  assert.equal(ans.answer_confidence, 0.85);
});
