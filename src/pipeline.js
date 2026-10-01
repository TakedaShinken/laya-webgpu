import { validateState, validateQuestions } from './schema.js';
import { softmax, parseChoiceAnswer, parseScoreAnswer, parseNoulAnswer } from './math.js';

/**
 * Returns prioritized execution provider array.
 */
export function getExecutionProviderOptions(hasWebGPU = true) {
  if (hasWebGPU) {
    return ['webgpu', 'wasm'];
  }
  return ['wasm'];
}

/**
 * Runs mock or real inference pipeline, returning formatted Laya results.
 */
export async function mockInferencePipeline(state, questions, options = {}) {
  validateState(state);
  validateQuestions(questions);

  const startTime = performance.now();
  const provider = options.hasWebGPU !== false ? 'webgpu' : 'wasm';

  // Simulate sub-35ms WebGPU forward pass
  await new Promise((r) => setTimeout(r, 10));

  const answers = {};
  for (const [qid, q] of Object.entries(questions)) {
    if (q.type === 'choice') {
      const keys = Object.keys(q.criteria);
      const logits = keys.map((_, i) => (i === 0 ? 3.0 : 0.5));
      answers[qid] = parseChoiceAnswer(keys, softmax(logits));
    } else if (q.type === 'score') {
      const logits = q.criteria.map((_, i) => (i === q.criteria.length - 1 ? 2.5 : 0.8));
      answers[qid] = parseScoreAnswer(q.criteria, softmax(logits));
    } else if (q.type === 'noul') {
      const logits = [0.2, 2.2];
      answers[qid] = parseNoulAnswer(softmax(logits));
    }
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 10) / 10;

  return {
    answers,
    elapsedMs,
    provider,
    routing: {
      model: typeof state === 'string' && /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf]/.test(state) ? "multilingual" : "english",
      device: provider
    }
  };
}
