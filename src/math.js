/**
 * Math utilities and answer post-processing for Laya decision heads.
 */

export function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Math.round((v / sum) * 10000) / 10000);
}

export function parseChoiceAnswer(options, probabilities) {
  let maxIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[maxIdx]) {
      maxIdx = i;
    }
  }

  const probMap = {};
  options.forEach((opt, idx) => {
    probMap[opt] = probabilities[idx] ?? 0;
  });

  return {
    type: "choice",
    choice: options[maxIdx],
    probabilities: probMap,
    answer_confidence: probabilities[maxIdx]
  };
}

export function parseScoreAnswer(legend, probabilities) {
  let expected = 0;
  let maxProb = 0;
  const probMap = {};

  legend.forEach((label, idx) => {
    const p = probabilities[idx] ?? 0;
    expected += idx * p;
    probMap[idx.toString()] = p;
    if (p > maxProb) maxProb = p;
  });

  return {
    type: "score",
    score: Math.round(expected * 10000) / 10000,
    legend: legend.reduce((acc, cur, idx) => ({ ...acc, [idx]: cur }), {}),
    probabilities: probMap,
    answer_confidence: maxProb
  };
}

export function parseNoulAnswer(probabilities) {
  const pTrue = probabilities[1] ?? 0;
  return {
    type: "noul",
    noul: pTrue,
    answer_confidence: Math.round(Math.max(pTrue, 1.0 - pTrue) * 10000) / 10000
  };
}
