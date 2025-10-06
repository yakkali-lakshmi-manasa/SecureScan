import { ScanResult } from '../types';

export function scanContent(type: string, content: string): ScanResult {
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

export async function saveContentScan(
  scanType: string,
  content: string,
  result: ScanResult
): Promise<void> {
  const scans = JSON.parse(localStorage.getItem('content_scans') || '[]');
  scans.unshift({
    id: crypto.randomUUID(),
    scan_type: scanType,
    input_content: content,
    result: result.result,
    detected_reasons: result.detectedReasons?.join('; '),
    created_at: new Date().toISOString(),
  });
  localStorage.setItem('content_scans', JSON.stringify(scans.slice(0, 100)));
}

export function getContentScans() {
  return JSON.parse(localStorage.getItem('content_scans') || '[]');
}
