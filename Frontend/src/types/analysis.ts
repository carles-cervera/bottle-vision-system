export type ModelType = 'nivell' | 'tap' | 'level';

export interface AnalysisResult {
  id: string;
  model: ModelType;
  label: string;
  confidence: number;
  timestamp: Date;
  imageName: string;
  imagePreview: string;
  responseTime?: number;
}

export interface ModelInfo {
  id: ModelType;
  title: string;
  description: string;
  icon: 'gauge' | 'circle-dot';
  endpoint: string;
}

// Analysis result from backend
export interface AnalysisData {
  label: string;
  confidence: number;
  image: string;
}

// Real-time WebSocket types - now receives complete bottle data
export interface BottleAnalysis {
  id: string;
  bottle_id: string;
  timestamp: string;
  tap: AnalysisData;
  level: AnalysisData;
  status: 'PASS' | 'FAIL';
  bottles_processed: number;
  hasAlert: boolean;
}

export interface WebSocketMessage {
  type: 'analysis_result';
  data: BottleAnalysis;
}
