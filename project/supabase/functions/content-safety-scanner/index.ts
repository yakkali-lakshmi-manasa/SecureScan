import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScanRequest {
  type: 'text' | 'url' | 'email' | 'qr_code';
  content: string;
}

interface ScanResult {
  result: 'Safe' | 'Unsafe';
  detectedReasons?: string[];
}

function scanContent(type: string, content: string): ScanResult {
  const reasons: string[] = [];

  const phishingPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /verify.*account/i,
    /confirm.*identity/i,
    /urgent.*action/i,
    /suspended.*account/i,
    /click.*here.*immediately/i,
    /won.*prize/i,
    /claim.*reward/i,
  ];

  const spamPatterns = [
    /buy.*now/i,
    /limited.*time.*offer/i,
    /act.*now/i,
    /free.*money/i,
    /make.*\$.*fast/i,
    /work.*from.*home/i,
    /lose.*weight.*fast/i,
    /viagra/i,
    /cialis/i,
  ];

  const abusivePatterns = [
    /\b(kill|murder|harm|attack)\b.*\b(you|yourself|someone)\b/i,
    /\b(hate|despise)\b.*\b(you|people|group)\b/i,
    /\b(threat|threaten|threatening)\b/i,
    /\b(violence|violent)\b/i,
  ];

  const maliciousUrlPatterns = [
    /\b(\d{1,3}\.){3}\d{1,3}\b/,
    /[^a-z0-9-.]\.[a-z]{2,}/i,
    /\.(exe|bat|cmd|scr|vbs|js|jar)$/i,
  ];

  phishingPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      reasons.push('Potential phishing content detected');
    }
  });

  spamPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      reasons.push('Spam or promotional content detected');
    }
  });

  abusivePatterns.forEach(pattern => {
    if (pattern.test(content)) {
      reasons.push('Abusive or harmful language detected');
    }
  });

  if (type === 'url' || type === 'qr_code') {
    maliciousUrlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        reasons.push('Suspicious URL pattern detected');
      }
    });

    if (!content.startsWith('https://') && content.includes('://')) {
      reasons.push('Non-secure URL detected');
    }
  }

  if (type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(content)) {
      reasons.push('Invalid email format');
    }

    const suspiciousEmailDomains = [
      '@tempmail',
      '@disposable',
      '@throwaway',
      '@guerrillamail',
    ];

    suspiciousEmailDomains.forEach(domain => {
      if (content.toLowerCase().includes(domain)) {
        reasons.push('Suspicious email domain detected');
      }
    });
  }

  const uniqueReasons = [...new Set(reasons)];

  return {
    result: uniqueReasons.length > 0 ? 'Unsafe' : 'Safe',
    detectedReasons: uniqueReasons.length > 0 ? uniqueReasons : undefined,
  };
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

    const { type, content }: ScanRequest = await req.json();

    if (!type || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type and content' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const scanResult = scanContent(type, content);

    const { error: dbError } = await supabase
      .from('content_scans')
      .insert({
        scan_type: type,
        input_content: content,
        result: scanResult.result,
        detected_reasons: scanResult.detectedReasons?.join('; ') || null,
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify(scanResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
