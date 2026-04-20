/**
 * Human-readable English labels for feature keys.
 *
 * Consumed by `zhFeatureName` in graphDataStore when the UI locale
 * is 'en'. Unknown keys fall back to the raw snake_case identifier.
 *
 * Keep in sync with FEATURE_NAME_ZH in graphDataStore.ts.
 */

export const FEATURE_NAME_EN: Record<string, string> = {
  // User demographics
  kyc_speed_sec:           'KYC completion (sec)',
  account_age_days:        'Account age (days)',
  age:                     'Age',
  is_female:               'Is female',
  is_high_risk_career:     'High-risk occupation',
  is_high_risk_income:     'High-risk income source',
  career_income_risk:      'Career × income risk',
  career_freq:             'Occupation frequency',
  is_app_user:             'App user',
  reg_hour:                'Registration hour',
  reg_is_night:            'Registered at night',
  reg_is_weekend:          'Registered on weekend',
  has_kyc_level2:          'KYC level 2',
  kyc_gap_days:            'KYC gap (days)',
  reg_to_kyc1_days:        'Days from registration to KYC1',
  // Fiat
  twd_dep_count:           'TWD deposit count',
  twd_dep_sum:             'TWD deposit total',
  twd_dep_mean:            'TWD deposit mean',
  twd_dep_std:             'TWD deposit std',
  twd_dep_max:             'TWD deposit max',
  twd_wit_count:           'TWD withdraw count',
  twd_wit_sum:             'TWD withdraw total',
  twd_wit_mean:            'TWD withdraw mean',
  twd_wit_std:             'TWD withdraw std',
  twd_wit_max:             'TWD withdraw max',
  twd_net_flow:            'TWD net inflow',
  twd_withdraw_ratio:      'Withdraw / deposit ratio',
  twd_smurf_flag:          'Structured-tx flag',
  twd_wit_ip_ratio:        'Withdraw IP coverage',
  // Crypto
  crypto_dep_count:        'Crypto deposit count',
  crypto_dep_sum:          'Crypto deposit total',
  crypto_dep_mean:         'Crypto deposit mean',
  crypto_dep_max:          'Crypto deposit max',
  crypto_wit_count:        'Crypto withdraw count',
  crypto_wit_sum:          'Crypto withdraw total (TWD)',
  crypto_wit_mean:         'Crypto withdraw mean',
  crypto_wit_max:          'Crypto withdraw max',
  crypto_currency_diversity:  'Currency diversity',
  crypto_protocol_diversity:  'Protocol diversity',
  crypto_wallet_hash_nunique: 'Unique wallet hashes',
  crypto_internal_count:      'Internal tx count',
  crypto_internal_peer_count: 'Internal tx peers',
  crypto_external_wit_count:  'On-chain withdraws',
  crypto_wit_ip_ratio:        'Crypto withdraw IP coverage',
  // Trading
  trading_count:           'Order fills',
  trading_sum:             'Order total',
  trading_mean:            'Order mean',
  trading_max:             'Order max',
  trading_buy_ratio:       'Buy-order ratio',
  trading_market_order_ratio: 'Market-order ratio',
  swap_count:              'One-click swap count',
  swap_sum:                'One-click swap total',
  total_trading_volume:    'Total trading volume',
  // IP
  ip_unique_count:         'Unique IPs',
  ip_total_count:          'IP usage count',
  ip_night_ratio:          'Night-ops IP ratio',
  ip_max_shared:           'Max IP sharing count',
  // Fund stay
  fund_stay_sec:           'Fund stay time (sec)',
  // Graph
  pagerank_score:          'PageRank score',
  graph_in_degree:         'In-degree',
  graph_out_degree:        'Out-degree',
  connected_component_size: 'Connected component size',
  betweenness_centrality:  'Betweenness centrality',
  // Cross-table
  total_tx_count:          'Total tx count',
  first_to_last_tx_days:   'First-to-last tx span (days)',
  weekend_tx_ratio:        'Weekend tx ratio',
  velocity_ratio_7d_vs_30d: '7d vs 30d velocity',
  // Red flags
  dep_to_first_wit_hours:  'Dep → first withdraw (hrs)',
  twd_to_crypto_out_ratio: 'Fiat-in → crypto-out ratio',
  tx_amount_cv:            'Tx amount CV',
  rapid_kyc_then_trade:    'Rapid KYC → trade',
  crypto_out_in_ratio:     'Crypto out / in',
  same_day_in_out_count:   'Same-day in/out days',
  // Temporal
  tx_interval_mean:        'Tx interval mean (sec)',
  tx_interval_std:         'Tx interval std',
  tx_interval_min:         'Tx interval min (sec)',
  tx_interval_median:      'Tx interval median',
  tx_burst_count:          'Tx burst count',
  amount_p90_p10_ratio:    'Amount P90/P10',
  active_days:             'Active days',
  active_day_ratio:        'Active day ratio',
  // Anomaly scores
  if_score:                'Isolation Forest score',
  hbos_score:              'HBOS score',
  lof_score:               'LOF score',
  // Composite
  composite_risk_score:    'Composite risk score',
  // GNN embeddings
  gnn_emb_0:  'GNN emb 0',  gnn_emb_1:  'GNN emb 1',
  gnn_emb_2:  'GNN emb 2',  gnn_emb_3:  'GNN emb 3',
  gnn_emb_4:  'GNN emb 4',  gnn_emb_5:  'GNN emb 5',
  gnn_emb_6:  'GNN emb 6',  gnn_emb_7:  'GNN emb 7',
  gnn_emb_8:  'GNN emb 8',  gnn_emb_9:  'GNN emb 9',
  gnn_emb_10: 'GNN emb 10', gnn_emb_11: 'GNN emb 11',
  gnn_emb_12: 'GNN emb 12', gnn_emb_13: 'GNN emb 13',
  gnn_emb_14: 'GNN emb 14', gnn_emb_15: 'GNN emb 15',
};
