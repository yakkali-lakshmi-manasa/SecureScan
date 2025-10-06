import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

function isLegalDocument(text: string): boolean {
  const lowerText = text.toLowerCase();
  let matchCount = 0;

  legalKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });

  return matchCount >= 5;
}

function extractNames(text: string): string[] {
  const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
  const matches = text.match(namePattern) || [];
  return [...new Set(matches)].slice(0, 10);
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return new Response(
        JSON.stringify({ error: 'Missing file or fileName' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const text = await file.text();

    if (!isLegalDocument(text)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please upload a valid legal document.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const names = extractNames(text);
    const dates = extractDates(text);
    const terms = extractLegalTerms(text);
    const risky = findRiskyPhrases(text);

    const extractedData = {
      names,
      dates,
      terms,
    };

    const summary = generateSummary(text, extractedData);

    const { data, error: dbError } = await supabase
      .from('document_analyses')
      .insert({
        document_name: fileName,
        document_type: file.type || 'unknown',
        is_legal_document: true,
        extracted_data: extractedData,
        risky_phrases: risky,
        summary,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save analysis to database'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
