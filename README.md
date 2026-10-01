# Laya WebGPU Studio

**In-Browser System 1 Decision Engine powered by WebGPU and ONNX Runtime Web.**

Laya WebGPU Studio executes typed decision models (`choice`, `score`, `noul`) directly inside the user's web browser in a single forward pass without server-side compute.

## ✨ Features
- **Client-Side WebGPU Inference**: Executes on local GPU via WebGPU (with WASM fallback).
- **Zero Server Costs**: Completely static architecture ready for global CDN deployment on Render.
- **Typed Decision Primitives**:
  - `choice`: Multi-class classification with criteria.
  - `score`: Continuous ordinal rubric evaluation.
  - `noul`: Calibrated Boolean Yes/No decision probability.
- **Preconfigured Presets**: Support Ticket Triage, Safety/Spam Moderation, and Japanese Outage Reports.

## 🚀 Getting Started

### 1. Install & Test
```bash
npm install
npm test
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## 🌐 Deployment to Render
- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
