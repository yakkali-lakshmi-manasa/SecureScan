export interface ScanResult {
  result: 'Safe' | 'Unsafe';
  detectedReasons?: string[];
}

export interface ContentScan {
  id: string;
  scan_type: 'text' | 'url' | 'email' | 'qr_code';
  input_content: string;
  result: 'Safe' | 'Unsafe';
  detected_reasons?: string;
  created_at: string;
}

export interface DocumentAnalysis {
  id: string;
  document_name: string;
  document_type: string;
  is_legal_document: boolean;
  extracted_data?: {
    names?: string[];
    dates?: string[];
    terms?: string[];
  };
  risky_phrases?: string[];
  summary?: string;
  created_at: string;
}
