# API Reference: Laya WebGPU

## 1. `validateState(state)`
- **Parameters**: `state` (string | object)
- **Returns**: `boolean`
- **Throws**: Error if state is null, undefined, or empty.

## 2. `validateQuestions(questions)`
- **Parameters**: `questions` (Record<string, QuestionDef>)
- **Supported Question Types**:
  - `choice`: Requires `instructions` (string) and `criteria` (object with >= 2 options).
  - `score`: Requires `instructions` (string) and `criteria` (array with >= 2 level descriptions).
  - `noul`: Requires `instructions` (string) for boolean classification.

## 3. `softmax(logits)`
- **Parameters**: `logits` (number[])
- **Returns**: `number[]` (Normalized probability array summing to 1.0)

## 4. `getExecutionProviderOptions(hasWebGPU)`
- **Parameters**: `hasWebGPU` (boolean)
- **Returns**: `string[]` (`['webgpu', 'wasm']` or `['wasm']`)
