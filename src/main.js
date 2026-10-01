import { mockInferencePipeline } from './pipeline.js';

// Predefined presets
const PRESETS = {
  support: {
    state: "Hi, we were billed twice for March on invoice #4411. Please refund the duplicate today or we will cancel our plan immediately.",
    questions: {
      department: {
        type: "choice",
        instructions: "Which department should handle this?",
        criteria: {
          billing: "invoices, payments, refunds",
          technical: "bugs, outages, system errors",
          sales: "pricing, new contracts",
          other: "everything else"
        }
      },
      urgency: {
        type: "score",
        instructions: "How urgent is this request?",
        criteria: ["not urgent", "soon", "critical deadline or blocking issue"]
      },
      churn_risk: {
        type: "noul",
        instructions: "Does the user threaten to cancel or leave?"
      },
      refund_requested: {
        type: "noul",
        instructions: "Does the user explicitly request a refund?"
      }
    }
  },
  safety: {
    state: "Congratulations! You won a $1,000 gift card. Click this link immediately to verify your SSN and claim prize: http://bit.ly/scam123",
    questions: {
      category: {
        type: "choice",
        instructions: "Classify this message",
        criteria: {
          phishing_spam: "fraud, fake prizes, suspicious links, phishing",
          harassment: "hate speech, personal attacks, threats",
          legitimate: "normal user communication"
        }
      },
      harm_severity: {
        type: "score",
        instructions: "Harm severity score",
        criteria: ["safe", "low risk", "high danger / fraud"]
      },
      is_malicious: {
        type: "noul",
        instructions: "Is this message harmful or scam?"
      }
    }
  },
  japanese: {
    state: "先週購入したソフトウェアのライセンスキーが届きません。ログインできず全社業務がストップしており大変困っています。至急確認して再発行してください。",
    questions: {
      department: {
        type: "choice",
        instructions: "担当部署を選定してください",
        criteria: {
          license_support: "ライセンス発行、認証、ログイン不具合",
          billing: "請求書発行、返金、カード決済",
          sales: "新規契約、プラン変更"
        }
      },
      urgency: {
        type: "score",
        instructions: "緊急度を評価してください",
        criteria: ["通常対応", "優先度高", "最優先 / 業務停止ブロッカー"]
      },
      business_halted: {
        type: "noul",
        instructions: "顧客の業務停止またはクリティカルな障害が発生していますか？"
      }
    }
  }
};

let hasWebGPU = false;

// Initialize hardware detection
async function initHardwareDetection() {
  const hwText = document.getElementById('hw-text');
  const hwDot = document.getElementById('hw-dot');

  if (typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
        hwText.textContent = "WebGPU 加速が利用可能です (Hardware Accelerated 🚀)";
        hwDot.style.background = "var(--success)";
        return;
      }
    } catch (e) {
      console.warn("WebGPU initialization failed:", e);
    }
  }

  hasWebGPU = false;
  hwText.textContent = "WebAssembly (WASM) フォールバックモードで稼働中 ⚡";
  hwDot.style.background = "var(--warning)";
}

// Load preset
function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;

  document.getElementById('input-state').value = preset.state;
  document.getElementById('input-questions').value = JSON.stringify(preset.questions, null, 2);

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === key);
  });
}

// Render Results
function renderResults(result) {
  document.getElementById('metric-latency').textContent = `${result.elapsedMs} ms`;
  document.getElementById('metric-model').textContent = result.routing.model === "multilingual" ? "mmBERT-base" : "ModernBERT-large";
  document.getElementById('metric-provider').textContent = result.provider.toUpperCase();

  const container = document.getElementById('results-container');
  container.innerHTML = '';

  for (const [qid, ans] of Object.entries(result.answers)) {
    const card = document.createElement('div');
    card.className = 'result-item';

    let contentHtml = '';

    if (ans.type === 'choice') {
      const rows = Object.entries(ans.probabilities)
        .map(([k, p]) => {
          const pct = Math.round(p * 100);
          return `
            <div class="prob-row">
              <span class="prob-label">${k}</span>
              <div class="prob-bar-container">
                <div class="prob-bar" style="width: ${pct}%"></div>
              </div>
              <span class="prob-val">${pct}%</span>
            </div>
          `;
        })
        .join('');

      contentHtml = `
        <div class="result-header">
          <span class="result-title">${qid}: <strong style="color: var(--primary)">${ans.choice}</strong></span>
          <span class="result-tag">確信度: ${Math.round(ans.answer_confidence * 100)}%</span>
        </div>
        ${rows}
      `;
    } else if (ans.type === 'score') {
      const rows = Object.entries(ans.probabilities)
        .map(([lvl, p]) => {
          const label = ans.legend[lvl] ?? lvl;
          const pct = Math.round(p * 100);
          return `
            <div class="prob-row">
              <span class="prob-label">${label}</span>
              <div class="prob-bar-container">
                <div class="prob-bar" style="width: ${pct}%"></div>
              </div>
              <span class="prob-val">${pct}%</span>
            </div>
          `;
        })
        .join('');

      contentHtml = `
        <div class="result-header">
          <span class="result-title">${qid}: <strong style="color: var(--primary)">スコア ${ans.score}</strong></span>
          <span class="result-tag">期待値</span>
        </div>
        ${rows}
      `;
    } else if (ans.type === 'noul') {
      const pTruePct = Math.round(ans.noul * 100);
      contentHtml = `
        <div class="result-header">
          <span class="result-title">${qid}: <strong style="color: ${pTruePct > 50 ? 'var(--danger)' : 'var(--success)'}">${pTruePct}% (True)</strong></span>
          <span class="result-tag">較正確率: ${Math.round(ans.answer_confidence * 100)}%</span>
        </div>
        <div class="prob-row">
          <span class="prob-label">判定確率</span>
          <div class="prob-bar-container">
            <div class="prob-bar" style="width: ${pTruePct}%; background: ${pTruePct > 50 ? 'var(--danger)' : 'var(--success)'}"></div>
          </div>
          <span class="prob-val">${pTruePct}%</span>
        </div>
      `;
    }

    card.innerHTML = contentHtml;
    container.appendChild(card);
  }
}

// Execution Handler
async function handleRun() {
  const btn = document.getElementById('run-btn');
  const state = document.getElementById('input-state').value;
  let questions;

  try {
    questions = JSON.parse(document.getElementById('input-questions').value);
  } catch (e) {
    alert("質問定義 (Questions) のJSON形式が正しくありません。\n" + e.message);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span>⏳ 推論処理中... (Forward Pass)</span>';

  try {
    const result = await mockInferencePipeline(state, questions, { hasWebGPU });
    renderResults(result);
  } catch (err) {
    alert("推論エラー: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀 WebGPU で推論実行 (Single Forward Pass)</span>';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initHardwareDetection();
  loadPreset('support');

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });

  document.getElementById('run-btn').addEventListener('click', handleRun);
});
