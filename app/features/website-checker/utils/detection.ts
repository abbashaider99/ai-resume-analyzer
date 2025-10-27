/**
 * Detection utilities for scam keywords and phishing patterns
 */

import type { PhishingDetection } from '../types';

/**
 * Check for common scam keywords in domain
 */
export const checkForScamKeywords = (domain: string): string[] => {
  const scamKeywords = [
    'free',
    'win',
    'prize',
    'lottery',
    'claim',
    'urgent',
    'verify',
    'account',
    'suspended',
    'bitcoin',
    'crypto-invest',
    'paypal',
    'secure',
    'update',
    'confirm',
    'banking',
  ];

  const foundKeywords: string[] = [];
  const lowerDomain = domain.toLowerCase();

  scamKeywords.forEach((keyword) => {
    if (lowerDomain.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  });

  return foundKeywords;
};

/**
 * Detect phishing patterns in domain name
 */
export const detectPhishingPatterns = (domain: string): PhishingDetection => {
  const patterns: string[] = [];
  let confidence = 0;
  let likelyTarget = '';

  const lowerDomain = domain.toLowerCase();

  // Common brand names that are often impersonated
  const popularBrands = [
    { name: 'google', variants: ['g00gle', 'googel', 'gogle', 'goog1e', 'go0gle'] },
    { name: 'facebook', variants: ['facebo0k', 'facebok', 'faceb00k', 'facebk'] },
    { name: 'paypal', variants: ['paypai', 'paypa1', 'paypa-l', 'paypol', 'paypai'] },
    { name: 'amazon', variants: ['amazom', 'amaz0n', 'arnazon', 'amazn'] },
    { name: 'microsoft', variants: ['micros0ft', 'rnicrosoft', 'microsft'] },
    { name: 'apple', variants: ['app1e', 'appl3', 'appie', 'aple'] },
    { name: 'netflix', variants: ['netfl1x', 'netfllx', 'netfiix', 'netfl-x'] },
    { name: 'instagram', variants: ['instagrarn', 'instagran', 'inst4gram'] },
    { name: 'whatsapp', variants: ['whatsap', 'what5app', 'whats-app', 'whatsaap'] },
  ];

  // Check for suspicious characters
  if (/[0-9]/.test(lowerDomain.replace(/\d{4,}/, ''))) {
    // Numbers replacing letters
    patterns.push('Contains numbers that may replace letters');
    confidence += 15;
  }

  // Check for excessive hyphens
  if ((lowerDomain.match(/-/g) || []).length > 2) {
    patterns.push('Excessive use of hyphens');
    confidence += 10;
  }

  // Check for homograph attacks (Unicode lookalikes)
  if (/[а-яА-Я]/.test(domain)) {
    // Cyrillic characters
    patterns.push('Contains Cyrillic characters that look like Latin');
    confidence += 25;
  }

  // Check for brand impersonation
  popularBrands.forEach((brand) => {
    // Check for exact brand name with extra parts
    if (
      lowerDomain.includes(brand.name) &&
      lowerDomain !== brand.name &&
      !lowerDomain.endsWith(brand.name + '.com')
    ) {
      const hasExtraPrefix =
        lowerDomain.startsWith(brand.name + '-') ||
        lowerDomain.startsWith(brand.name + '_') ||
        lowerDomain.includes('-' + brand.name) ||
        lowerDomain.includes('_' + brand.name);

      if (
        hasExtraPrefix ||
        lowerDomain.includes(brand.name + '-') ||
        lowerDomain.includes(brand.name + 'secure')
      ) {
        patterns.push(
          `Appears to impersonate ${brand.name.charAt(0).toUpperCase() + brand.name.slice(1)}`
        );
        likelyTarget = brand.name.charAt(0).toUpperCase() + brand.name.slice(1);
        confidence += 30;
      }
    }

    // Check for variant spellings
    brand.variants.forEach((variant) => {
      if (lowerDomain.includes(variant)) {
        patterns.push(
          `Suspicious spelling variation of ${brand.name.charAt(0).toUpperCase() + brand.name.slice(1)}`
        );
        likelyTarget = brand.name.charAt(0).toUpperCase() + brand.name.slice(1);
        confidence += 35;
      }
    });
  });

  // Check for excessive length
  if (lowerDomain.length > 30) {
    patterns.push('Unusually long domain name');
    confidence += 5;
  }

  // Check for suspicious TLDs with brand names
  const suspiciousCombinations = ['secure', 'login', 'verify', 'account', 'auth', 'support'];
  suspiciousCombinations.forEach((word) => {
    if (lowerDomain.includes(word)) {
      patterns.push(`Contains suspicious keyword: "${word}"`);
      confidence += 10;
    }
  });

  const isPhishing = confidence >= 25;

  return {
    isPhishing,
    confidence: Math.min(100, confidence),
    patterns,
    likelyTarget: likelyTarget || undefined,
  };
};
