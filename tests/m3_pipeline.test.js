import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExecutionProviderOptions, mockInferencePipeline } from '../src/pipeline.js';

test('M3: getExecutionProviderOptions prioritizes webgpu with wasm fallback', () => {
  const providers = getExecutionProviderOptions(true);
  assert.deepEqual(providers, ['webgpu', 'wasm']);

  const fallback = getExecutionProviderOptions(false);
  assert.deepEqual(fallback, ['wasm']);
});

test('M3: mockInferencePipeline executes and formats complete Laya response', async () => {
  const state = "Please refund my double payment.";
  const questions = {
    dept: { type: "choice", instructions: "department", criteria: { billing: "refund", other: "else" } }
  };

  const res = await mockInferencePipeline(state, questions);
  assert.ok(res.answers.dept);
  assert.equal(res.answers.dept.type, "choice");
  assert.ok(res.elapsedMs >= 0);
  assert.ok(res.provider);
});
