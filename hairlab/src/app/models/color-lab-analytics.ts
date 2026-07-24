export interface ColorLabAnalyticsLine {
  brand: string;
  lineName: string;
  totalFormulas: number;
  usedFormulas: number;
  positiveResults: number;
  attentionResults: number;
  successRatePercent: number;
}

export interface ColorLabAnalytics {
  totalFormulas: number;
  usedFormulas: number;
  draftOrProposedFormulas: number;
  smartFormulaCount: number;
  manualFormulaCount: number;
  recurringFormulaCount: number;
  revisionFormulaCount: number;
  referenceFormulaCount: number;
  customersWithFormulas: number;
  totalResults: number;
  positiveResults: number;
  attentionResults: number;
  missingResults: number;
  resultCoveragePercent: number;
  successRatePercent: number;
  smartSuccessRatePercent: number;
  manualSuccessRatePercent: number;
  topLines: ColorLabAnalyticsLine[];
  dataQualityWarnings: string[];
}
