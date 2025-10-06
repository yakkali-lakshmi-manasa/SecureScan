import { DocumentAnalysis } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

const legalKeywords = [
  'agreement',
  'contract',
  'party',
  'parties',
  'hereby',
  'whereas',
  'shall',
  'pursuant',
  'hereinafter',
  'consideration',
  'covenant',
  'liability',
  'indemnify',
  'jurisdiction',
  'governing law',
  'arbitration',
  'dispute',
  'breach',
  'termination',
  'amendment',
];

const riskyPhrases = [
  'without limitation',
  'as is',
  'no warranty',
  'unlimited liability',
  'irrevocable',
  'perpetual',
  'automatic renewal',
  'binding arbitration',
  'waive',
  'forfeit',
  'sole discretion',
  'may change at any time',
  'without notice',
];

// --- Utility Functions ---

function isLegalDocument(text: string): boolean {
  const lowerText = text.toLowerCase();
  let matchCount = 0;

  legalKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });

  // Loosen threshold slightly to reduce false negatives
  return matchCount >= 3;
}

function extractNames(text: string): string[] {
  const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
  const matches = text.match(namePattern) || [];
  const filtered = matches.filter(
    n =>
      !n.toLowerCase().includes('service') &&
      !n.toLowerCase().includes('agreement') &&
      !n.toLowerCase().includes('provider') &&
      !n.toLowerCase().includes('client')
  );
  return [...new Set(filtered)].slice(0, 10);
}


function extractDates(text: string): string[] {
  const datePatterns = [
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
  ];

  const dates: string[] = [];
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    dates.push(...matches);
  });

  return [...new Set(dates)].slice(0, 10);
}

function extractLegalTerms(text: string): string[] {
  const terms: string[] = [];
  const lowerText = text.toLowerCase();

  legalKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      terms.push(keyword);
    }
  });

  return [...new Set(terms)].slice(0, 15);
}

function findRiskyPhrases(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  riskyPhrases.forEach(phrase => {
    if (lowerText.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  });

  return found;
}

function generateSummary(text: string, extractedData: any): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const importantSentences = sentences.slice(0, 3).map(s => s.trim());

  let summary = 'This document appears to be a legal agreement. ';

  if (extractedData.names && extractedData.names.length > 0) {
    summary += `It involves parties including ${extractedData.names.slice(0, 2).join(' and ')}. `;
  }

  if (extractedData.dates && extractedData.dates.length > 0) {
    summary += `Key dates mentioned include ${extractedData.dates[0]}. `;
  }

  if (extractedData.terms && extractedData.terms.length > 0) {
    summary += `The document contains terms related to ${extractedData.terms.slice(0, 3).join(', ')}. `;
  }

  if (importantSentences.length > 0) {
    summary += `Key content: ${importantSentences[0]}.`;
  }

  return summary;
}

// --- File Text Extraction Helper ---

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((s: any) => s.str).join(' ');
      text += pageText + '\n';
    }
    return text;
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  // Default for .txt or others
  return await file.text();
}

// --- Main Analyzer Function ---

export async function analyzeDocument(
  file: File
): Promise<{ success: boolean; analysis?: DocumentAnalysis; error?: string }> {
  try {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      return {
        success: false,
        error: 'Please upload a valid legal document (PDF, Word, or Text file).',
      };
    }

    const text = await extractTextFromFile(file);

    if (!text || text.trim().length < 50) {
      return {
        success: false,
        error: 'Unable to read text from document. Please ensure the file is not encrypted or image-based.',
      };
    }

    if (!isLegalDocument(text)) {
      return {
        success: false,
        error: 'Please upload a valid legal document (not enough legal terminology detected).',
      };
    }

    const names = extractNames(text);
    const dates = extractDates(text);
    const terms = extractLegalTerms(text);
    const risky = findRiskyPhrases(text);

    const extractedData = { names, dates, terms };
    const summary = generateSummary(text, extractedData);

    const analysis: DocumentAnalysis = {
      id: crypto.randomUUID(),
      document_name: file.name,
      document_type: file.type || 'unknown',
      is_legal_document: true,
      extracted_data: extractedData,
      risky_phrases: risky,
      summary,
      created_at: new Date().toISOString(),
    };

    const analyses = JSON.parse(localStorage.getItem('document_analyses') || '[]');
    analyses.unshift(analysis);
    localStorage.setItem('document_analyses', JSON.stringify(analyses.slice(0, 50)));

    return { success: true, analysis };
  } catch (error) {
    console.error('Document analysis failed:', error);
    return {
      success: false,
      error: 'Failed to analyze document. Please try again.',
    };
  }
}

export function getDocumentAnalyses(): DocumentAnalysis[] {
  return JSON.parse(localStorage.getItem('document_analyses') || '[]');
}
