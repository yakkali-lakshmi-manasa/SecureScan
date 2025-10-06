/*
  # Content Safety Scanner and Legal Document Analyzer Schema

  ## New Tables

  ### 1. content_scans
  - `id` (uuid, primary key) - Unique scan identifier
  - `user_id` (uuid, nullable) - User who performed the scan
  - `scan_type` (text) - Type of scan: 'text', 'url', 'email', 'qr_code'
  - `input_content` (text) - The original input content
  - `result` (text) - Scan result: 'Safe' or 'Unsafe'
  - `detected_reasons` (text, nullable) - Reasons for unsafe classification
  - `created_at` (timestamptz) - Timestamp of scan

  ### 2. document_analyses
  - `id` (uuid, primary key) - Unique analysis identifier
  - `user_id` (uuid, nullable) - User who uploaded the document
  - `document_name` (text) - Original document filename
  - `document_type` (text) - File type (PDF, DOCX, etc.)
  - `is_legal_document` (boolean) - Whether document was validated as legal
  - `extracted_data` (jsonb, nullable) - Extracted key details (names, dates, terms)
  - `risky_phrases` (jsonb, nullable) - Array of highlighted risky phrases
  - `summary` (text, nullable) - Plain-language summary
  - `created_at` (timestamptz) - Timestamp of analysis

  ## Security
  - Enable RLS on both tables
  - Add policies for public access to insert and read data
  - Public access allowed for this demo application
*/

CREATE TABLE IF NOT EXISTS content_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  scan_type text NOT NULL,
  input_content text NOT NULL,
  result text NOT NULL,
  detected_reasons text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  document_name text NOT NULL,
  document_type text NOT NULL,
  is_legal_document boolean DEFAULT false,
  extracted_data jsonb,
  risky_phrases jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert content scans"
  ON content_scans FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view content scans"
  ON content_scans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert document analyses"
  ON document_analyses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view document analyses"
  ON document_analyses FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_content_scans_created_at ON content_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_analyses_created_at ON document_analyses(created_at DESC);
