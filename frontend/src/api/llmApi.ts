import type { ShapWaterfallFeature, FpFnMode } from '../types/index';

export interface LLMAnalysisRequest {
  mode: FpFnMode;
  userId: number;
  riskScore: number;
  features: ShapWaterfallFeature[];
  baseValue: number;
  /** Locale hint — 'en' or 'zh'. Defaults to en. */
  locale?: 'en' | 'zh';
}

export interface LLMAnalysisResponse {
  content: string;
}

function buildSystemPrompt(locale: 'en' | 'zh'): string {
  if (locale === 'zh') {
    return `你是一位資深金融科技詐騙偵測模型的可解釋性專家（XAI Expert），專精於 SHAP（SHapley Additive exPlanations）值分析與機器學習模型誤判診斷。

你的核心能力：
1. 深度解讀 SHAP 值：正值代表該特徵推高詐騙機率，負值代表降低詐騙機率，數值大小表示影響強度
2. 識別模型決策邊界：理解模型為何在特定特徵組合下做出錯誤判斷
3. 針對 FP（False Positive，正常用戶被誤判為詐騙）與 FN（False Negative，詐騙用戶漏判為正常）提供差異化分析

回答規範：
- 使用繁體中文
- 結構清晰：先點出核心誤判原因，再逐一分析關鍵特徵，最後解析模型決策邏輯
- 語言精確但易懂，避免過度技術術語
- 每次分析需要明確說明哪些特徵「誤導」了模型`;
  }
  return `You are a senior Explainable AI (XAI) expert for financial-fraud-detection models, specializing in SHAP (SHapley Additive exPlanations) analysis and diagnosis of model misclassifications.

Your core capabilities:
1. Deep interpretation of SHAP values — positive values push fraud probability up, negative values pull it down, magnitude indicates strength of influence.
2. Identifying decision-boundary behavior — understanding why the model errs on specific feature combinations.
3. Differentiating analysis for False Positives (normal user flagged as fraud) vs. False Negatives (fraud user missed).

Response rules:
- Respond in clear professional English.
- Structure: (1) root cause of misclassification, (2) key misleading features one by one, (3) decision-logic interpretation.
- Precise but accessible language — avoid jargon unless needed.
- Always call out which features actively misled the model.`;
}

function buildUserPrompt(req: LLMAnalysisRequest, locale: 'en' | 'zh'): string {
  const sortedFeatures = [...req.features]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 10);
  const finalScore = req.baseValue + sortedFeatures.reduce((s, f) => s + f.contribution, 0);

  if (locale === 'zh') {
    const modeLabel = req.mode === 'fp'
      ? 'False Positive（FP）— 正常用戶被模型誤判為詐騙（白→黑誤判）'
      : 'False Negative（FN）— 詐騙用戶被模型漏判為正常（黑→白漏判）';
    const featureRows = sortedFeatures.map((f, i) => {
      const direction = f.contribution > 0 ? '▲ 推高詐騙機率' : '▼ 降低詐騙機率';
      return `  ${i + 1}. ${f.feature_name}（實際值：${f.feature_value}）｜SHAP 貢獻：${f.contribution > 0 ? '+' : ''}${f.contribution.toFixed(4)}  ${direction}`;
    }).join('\n');
    return `## 待分析案例

- **用戶 ID**：${req.userId}
- **誤判類型**：${modeLabel}
- **模型風險分數**：${req.riskScore.toFixed(4)}（閾值 0.9784）
- **SHAP 基準值（群體平均）**：${req.baseValue.toFixed(4)}
- **加總後預測值**：${finalScore.toFixed(4)}

## 前 10 大 SHAP 特徵貢獻（依影響強度排序）

${featureRows}

---

請針對此用戶的 **${req.mode === 'fp' ? '誤判為詐騙' : '漏判詐騙'}** 情況進行深度分析：

1. **核心誤判原因**（2-3 句精要說明）
2. **關鍵誤導特徵分析**（列出最重要的 3-5 個特徵，說明為何這些特徵導致模型判斷錯誤）
3. **模型決策邏輯解析**（從 SHAP 正負貢獻的角度說明模型如何「思考」）`;
  }

  const modeLabel = req.mode === 'fp'
    ? 'False Positive (FP) — a normal user incorrectly flagged as fraud (white predicted as black)'
    : 'False Negative (FN) — a fraud user missed by the model (black predicted as white)';
  const featureRows = sortedFeatures.map((f, i) => {
    const direction = f.contribution > 0 ? '▲ increases fraud probability' : '▼ decreases fraud probability';
    return `  ${i + 1}. ${f.feature_name} (observed value: ${f.feature_value}) | SHAP contribution: ${f.contribution > 0 ? '+' : ''}${f.contribution.toFixed(4)}  ${direction}`;
  }).join('\n');
  return `## Case to analyze

- **User ID**: ${req.userId}
- **Misclassification type**: ${modeLabel}
- **Model risk score**: ${req.riskScore.toFixed(4)} (decision threshold 0.9784)
- **SHAP base value (group average)**: ${req.baseValue.toFixed(4)}
- **Sum predicted score**: ${finalScore.toFixed(4)}

## Top 10 SHAP feature contributions (by magnitude)

${featureRows}

---

For this user's **${req.mode === 'fp' ? 'false-positive classification' : 'false-negative miss'}**, provide a thorough analysis:

1. **Root cause of misclassification** (2–3 concise sentences).
2. **Key misleading features** (pick the 3–5 most important features, explain why each drove the wrong decision).
3. **Decision-logic interpretation** (explain how the model "reasons" based on positive vs. negative SHAP contributions).`;
}

export async function analyzeMisclassification(
  req: LLMAnalysisRequest,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Add VITE_GROQ_API_KEY=<key> to your .env file.');
  }
  const locale: 'en' | 'zh' = req.locale === 'zh' ? 'zh' : 'en';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt(locale) },
        { role: 'user',   content: buildUserPrompt(req, locale) },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Unexpected Groq response format');
  return content as string;
}
