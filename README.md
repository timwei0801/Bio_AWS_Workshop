<h1 align="center">BitoGuard: Intelligent Compliance Risk Radar</h1>

<p align="center">
  <strong>AI-Powered Blacklist Detection for Cryptocurrency Exchanges — GNN + Stacking Ensemble Hybrid Model</strong>
</p>

<p align="center">
  <a href="https://timwei0801.github.io/Bio_AWS_Workshop/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?logo=github" alt="Live Demo"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/Python-3.9+-blue.svg?logo=python" alt="Python"></a>
  <a href="https://pytorch.org/"><img src="https://img.shields.io/badge/PyTorch-GNN-orange.svg?logo=pytorch" alt="PyTorch"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue.svg?logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript" alt="TypeScript"></a>
  <img src="https://img.shields.io/badge/🏆_Agent_for_Truth-Hackathon-gold" alt="Hackathon">
</p>

<p align="center">
  <a href="README_ZH.md">中文</a> | <a href="README.md">English</a>
</p>

---

## Demo

<p align="center">
  <img src="assets/demo.gif" alt="BitoGuard Dashboard Demo" width="800">
</p>

> Interactive 3D risk dashboard — real-time visualization of transaction network graphs, node risk scores, and SHAP explainability analysis

---

## Overview

<table>
<tr>
<td width="60%">

Cryptocurrency exchanges face a critical **mule account (blacklisted user)** problem — these accounts are exploited for money laundering, fraud fund transfers, and other illicit activities.

This project analyzes **770,000+ transaction records** using a dual-track strategy to build an end-to-end risk detection system:

- **Heterogeneous GNN**: HeteroSAGE + GAT to capture risk propagation paths
- **3-Model Stacking Ensemble**: XGBoost + LightGBM (Focal Loss) + CatBoost
- **SHAP Explainability**: Per-case risk attribution + counterfactual suggestions
- **Fairness Audit**: Bias detection across gender, age, career, and income

</td>
<td width="40%">

<img src="assets/architecture.svg" alt="System Architecture" width="100%">

</td>
</tr>
</table>

---

## Competition & Events

This project was developed for the [**Agent for Truth: Disinformation Defense Hackathon**](https://www.ai-expo.tw/kiro_hackathon_2026/), tackling the **BitoPro — Cryptocurrency Transaction Security** challenge track.

| Item | Details |
|------|---------|
| **Hackathon** | Agent for Truth: Disinformation Defense Hackathon |
| **Organizers** | DIGITIMES × National Development Council × AWS |
| **Partners** | BitoPro, Gogolook |
| **Date** | March 26–27, 2026 |
| **Venue** | AWS Nanshan Office / Taipei Expo Park (Taiwan AI EXPO 2026) |
| **Challenge** | Cryptocurrency Transaction Security — Mule Account & Fraud Detection |

<table>
<tr>
<td width="50%">
<p align="center">
  <img src="assets/ai-expo-2026.jpeg" alt="Taiwan AI EXPO 2026" width="100%">
</p>
<p align="center"><sub><b>Taiwan AI EXPO 2026</b> — Team presenting BitoGuard at the venue</sub></p>
</td>
<td width="50%">
<p align="center">
  <img src="assets/hackathon-team.jpeg" alt="Agent for Truth Hackathon" width="100%">
</p>
<p align="center"><sub><b>Agent for Truth Hackathon</b> — Competition at Taipei Expo Park</sub></p>
</td>
</tr>
</table>

---

## Key Features

| | | | |
|:---:|:---:|:---:|:---:|
| **81-dim Feature Engineering** | **Heterogeneous GNN** | **3-Model Stacking** | **SHAP Explainability** |
| 10 categories, 65 selected | HeteroSAGE + GAT | XGB + LGB + CAT | Global + Local + Counterfactual |

| | | | |
|:---:|:---:|:---:|:---:|
| **Fairness Audit** | **Interactive 3D Dashboard** | **Semi-supervised Learning** | **Anomaly Detection** |
| 4-dimension bias check | React + Three.js | Pseudo-Labeling | IF / HBOS / LOF |

---

## Performance

<table>
<tr>
<td width="25%" align="center">
<h3>0.861</h3>
<sub>AUC-ROC</sub>
</td>
<td width="25%" align="center">
<h3>0.307</h3>
<sub>AUC-PR</sub>
</td>
<td width="25%" align="center">
<h3>0.463</h3>
<sub>Recall</sub>
</td>
<td width="25%" align="center">
<h3>0.357</h3>
<sub>F1-Score</sub>
</td>
</tr>
</table>

---

## System Architecture

<p align="center">
  <img src="assets/architecture.svg" alt="System Architecture" width="100%"/>
</p>

---

## Full Pipeline

### Step 1: Data Loading & Validation

Load data from 5 transaction tables + user info table, with strict column type conversion, missing value reporting, and blacklist ratio validation.

### Step 2: Feature Engineering (81 → 65 dimensions)

Extract **81 features** from 5 raw transaction tables across **10 categories**:

| # | Category | Count | Key Features | Detection Intent |
|---|----------|-------|--------------|------------------|
| 1 | **User Demographics** | 15 | `kyc_speed_sec`, `account_age_days`, `reg_hour` | KYC anomaly, late-night registration |
| 2 | **Fiat Transactions** | 14 | `twd_dep_sum`, `twd_net_flow`, `twd_smurf_flag` | Net outflow, smurfing |
| 3 | **Crypto Transactions** | 15 | `crypto_wit_sum`, `crypto_wallet_hash_nunique` | Multi-wallet dispersed withdrawals |
| 4 | **Trading/Swap** | 9 | `trading_buy_ratio`, `swap_sum` | One-sided buying, wash trading |
| 5 | **IP & Fund Velocity** | 5 | `ip_unique_count`, `ip_night_ratio`, `fund_stay_sec` | IP hopping, rapid in-out |
| 6 | **Graph Topology** | 5 | `pagerank_score`, `connected_component_size` | Fund hubs, fraud clusters |
| 7 | **Cross-table Derived** | 4 | `total_tx_count`, `weekend_tx_ratio` | Activity acceleration |
| 8 | **AML Red Flags** | 6 | `twd_to_crypto_out_ratio`, `same_day_in_out_count` | Fiat-to-crypto funnel |
| 9 | **Temporal Patterns** | 7 | `tx_interval_mean`, `amount_p90_p10_ratio` | Regular patterns, burst trading |
| 10 | **Composite Risk** | 1 | `composite_risk_score` | Multi-dimension weighted score |

<details>
<summary><b>Feature Selection Process (81 → 65)</b></summary>

1. **Zero-variance removal**: `has_kyc_level2` (1 feature)
2. **High-correlation removal** (threshold ≥ 0.95): 13 highly collinear features
3. **Zero-importance removal**: `betweenness_centrality`, `velocity_ratio_7d_vs_30d` (2 features)

> Anomaly detection scores (3 dims) and GNN embeddings (16 dims) are added later. After fairness audit removes `is_female` and `age`, the final model input is **82 dimensions**.

</details>

### Step 3: Anomaly Detection Features

| Algorithm | Output Feature | Principle |
|-----------|---------------|-----------|
| **Isolation Forest** | `if_score` | Random partition isolation — shorter paths = more anomalous |
| **HBOS** | `hbos_score` | Histogram density estimation — low-density regions = anomalous |
| **LOF** | `lof_score` | Local outlier factor — greater deviation from neighborhood density |

### Step 4: Graph Neural Network (GNN)

Build a **Heterogeneous Graph** using on-chain wallet addresses to capture **risk propagation relationships** that traditional tabular features cannot express.

<p align="center">
  <img src="assets/gnn-architecture.svg" alt="GNN Architecture" width="100%"/>
</p>

### Step 5: Stacking Ensemble

Two-layer stacking architecture with three base learners using **different loss functions** to maximize model diversity:

<p align="center">
  <img src="assets/stacking-ensemble.svg" alt="Stacking Ensemble Architecture" width="100%"/>
</p>

<details>
<summary><b>Imbalance Handling Strategy</b></summary>

- **Focal Loss** (LightGBM): α=0.75, γ=2.0 — auto-increase loss weight for borderline samples
- **scale_pos_weight=50** (XGBoost / CatBoost): positive-negative ratio weighting
- **Borderline-SMOTE** (optional): 30% oversampling for borderline minority class only

</details>

### Step 6: SHAP Explainability Analysis

**Global Explanation** — Top 10 Feature Importance:

| Rank | Feature | Description | SHAP Share | Cumulative |
|------|---------|-------------|-----------|------------|
| 1 | `tx_interval_median` | Median transaction interval | 5.61% | 5.61% |
| 2 | `swap_sum` | Total swap amount | 5.60% | 11.21% |
| 3 | `account_age_days` | Account age | 5.48% | 16.69% |
| 4 | `crypto_wit_sum` | Total crypto withdrawal | 4.93% | 21.63% |
| 5 | `weekend_tx_ratio` | Weekend transaction ratio | 3.56% | 25.19% |
| 6 | `career_freq` | Career frequency | 3.36% | 28.55% |
| 7 | `ip_night_ratio` | Night-time operation ratio | 3.09% | 31.64% |
| 8 | `twd_net_flow` | Fiat net inflow | 3.00% | 34.64% |
| 9 | `tx_interval_mean` | Mean transaction interval | 2.68% | 37.32% |
| 10 | `reg_hour` | Registration hour | 2.41% | 39.73% |

> GNN embedding features contribute ~**12.8%** combined. Anomaly detection scores contribute ~**3.0%** combined.

<details>
<summary><b>Local Explanation + Counterfactual + SSR Stability</b></summary>

**Local Explanation**: Per-user SHAP Waterfall Plot — base value → feature push/pull → final prediction

**Counterfactual Analysis**: Auto-suggest which feature adjustments can reduce risk
- Example: "Adjusting KYC completion speed from 54,799s to 0 could reduce risk score by 0.014"

**SSR Stability Verification**: Perturb feature values at ε = 0.05 ~ 0.20 to verify SHAP ranking robustness

</details>

### Step 7: Fairness Audit

| Protected Attribute | Result | DPD | TPR Gap | FPR Gap | DIR |
|---------------------|--------|-----|---------|---------|-----|
| **Gender** | **FAIL** | 0.078 | 0.185 | 0.054 | 0.281 |
| **Age** | **FAIL** | 0.079 | 0.094 | 0.067 | 0.239 |
| **Career Risk** | **PASS** | 0.009 | 0.028 | 0.008 | 0.849 |
| **Income Source** | **FAIL** | 0.022 | 0.088 | 0.017 | 0.587 |

<details>
<summary><b>Key Findings & Recommendations</b></summary>

- Female user TPR 54.7% vs Male 36.2% (females flagged at 1.51x rate)
- Age 30-50 group TPR 49.7% significantly higher than other age groups
- **Recommendation**: Remove `is_female` + `age` (no AML business justification), retain `is_high_risk_career` + `is_high_risk_income` (regulatory basis, passed fairness check)

</details>

---

## Interactive Risk Dashboard

Built with React + TypeScript + Vite, supporting three viewing modes:

| Mode | Features |
|------|----------|
| **Fraud Mode** | 2D/3D force-directed transaction network graph, KPI stats, high-risk user list, per-node SHAP analysis |
| **FP/FN Mode** | Misclassification analysis + SHAP Waterfall charts explaining model errors |
| **Predict Mode** | 12,753 unlabeled user predictions with risk scores + Top SHAP feature contributions |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Machine Learning** | XGBoost, CatBoost, LightGBM (Focal Loss), Scikit-learn |
| **Deep Learning** | PyTorch, PyTorch Geometric (Heterogeneous GNN) |
| **Imbalance Handling** | Borderline-SMOTE, scale_pos_weight, Focal Loss |
| **Anomaly Detection** | Isolation Forest, HBOS, LOF |
| **Explainability** | SHAP (TreeExplainer), SSR Stability, Counterfactual Analysis |
| **Fairness** | Demographic Parity, Equalized Odds, Disparate Impact |
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **Visualization** | react-force-graph-2d/3d, Three.js, Recharts |
| **Styling** | Tailwind CSS 3 |

---

## Quick Start

### Model Training

```bash
# Install Python dependencies
pip install xgboost catboost lightgbm scikit-learn shap torch torch_geometric imbalanced-learn pyod

# Run full pipeline (12 automated steps)
cd Wei_model/model
python main.py --data_dir ../../adjust_data/train --output ../output

# Skip GNN (without GPU)
python main.py --data_dir ../../adjust_data/train --output ../output --skip_gnn
```

### Frontend Dashboard

```bash
cd frontend
npm install
npm run dev          # Dev mode (http://localhost:5173)
npm run build        # Production build
npm test             # Run unit tests (vitest)
```

**Keyboard shortcuts**

| Key | Action |
|-----|--------|
| `1`–`7` | Jump to Overview / Features / Blacklist / FP / FN / Predict / Compare |
| `⌘/Ctrl + K` | Open command palette (search sections & user IDs) |
| `/` | Focus the search input |
| `Shift + P` | Toggle print-friendly mode |

**Deep links**

Every page exposes its state in the URL hash: `#/fp?user=226`, `#/predict?user=124785`, etc. These can be bookmarked or shared.

### Deployment (GitHub Pages)

Deployment is fully automated. Pushing to `main` with any change under `frontend/` triggers the `Deploy frontend to GitHub Pages` workflow (see `.github/workflows/deploy-pages.yml`), which builds with `npm ci && npm run build` and publishes to Pages via `actions/deploy-pages`. No manual build / gh-pages branch maintenance needed.

```bash
git push origin main
gh run watch           # optional — follow the deploy
```

---

## Project Structure

<details>
<summary><b>Expand full directory</b></summary>

```
Bio_AWS_Workshop/
├── Wei_model/                          # Core ML Pipeline
│   ├── model/
│   │   ├── main.py                    # Main training entry (12 steps)
│   │   ├── Feature_engineering.py     # Feature engineering (10 categories, 81 dims)
│   │   ├── feature_selection.py       # Feature selection (81 → 65)
│   │   ├── anomaly_detection.py       # Unsupervised anomaly detection (IF/HBOS/LOF)
│   │   ├── Gnn_model.py              # Heterogeneous GNN (HeteroSAGE + GAT)
│   │   ├── ensemble.py               # Stacking Ensemble (XGB + LGB + CAT)
│   │   ├── shap_explainer.py         # SHAP explainability + SSR + counterfactual
│   │   ├── fairness_audit.py         # 4-dimension fairness audit
│   │   └── pseudo_labeling.py        # Semi-supervised Pseudo-Labeling
│   └── output/                        # Model outputs
│
├── Yu_model/                          # Fund tracing model
│   └── trace_back_model/             # Fraud fund chain tracking
│
├── frontend/                           # React interactive dashboard
│   ├── src/
│   │   ├── components/               # UI components
│   │   ├── utils/                    # Data processing & graph logic
│   │   └── types/                    # TypeScript types
│   └── output/                        # CSV data for frontend
│
├── assets/                            # Architecture diagrams & media
└── docs/                              # Documentation
```

</details>

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <a href="https://github.com/timwei0801/Bio_AWS_Workshop">
    <img src="https://img.shields.io/github/stars/timwei0801/Bio_AWS_Workshop.svg?style=social" alt="GitHub Stars">
  </a>
  <a href="https://github.com/timwei0801/Bio_AWS_Workshop/fork">
    <img src="https://img.shields.io/github/forks/timwei0801/Bio_AWS_Workshop.svg?style=social" alt="GitHub Forks">
  </a>
</p>

<p align="center">
  <sub>BitoGuard — AI-Powered AML Risk Detection for Cryptocurrency Exchanges</sub>
</p>
