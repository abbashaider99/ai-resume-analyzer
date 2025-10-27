/**
 * Trust score calculation utilities
 */

import {
    COUNTRY_GOV_PATTERNS,
    SPECIAL_DOMAIN_SCORES,
    SUSPICIOUS_TLDS
} from '../constants';

/**
 * Calculate trust score for a website
 */
export const calculateTrustScore = (
  domainAge: number | null,
  hasSSL: boolean,
  scamKeywords: string[],
  domainLength: number,
  phishingConfidence?: number,
  domainName?: string,
  registrar?: string | null,
  organization?: string | null
): number => {
  console.log('=== Trust Score Calculation Debug ===');
  console.log('Input Parameters:');
  console.log('- Domain Age:', domainAge, 'years');
  console.log('- Has SSL:', hasSSL);
  console.log('- Scam Keywords:', scamKeywords);
  console.log('- Domain Length:', domainLength);
  console.log('- Phishing Confidence:', phishingConfidence);
  console.log('- Domain Name:', domainName);
  console.log('- Registrar:', registrar);
  console.log('- Organization:', organization);

  // SPECIAL HANDLING: .edu and .gov domains (including country-specific .gov variants)
  if (domainName) {
    const lowerDomain = domainName.toLowerCase();

    // Check for .edu domains (primarily US)
    const isEduDomain = lowerDomain.endsWith('.edu');

    // Check for .gov domains (US and country-specific like .gov.in, .gov.pk, .gov.uk, etc.)
    const isGovDomain =
      lowerDomain.endsWith('.gov') ||
      lowerDomain.match(/\.gov\.[a-z]{2,3}$/i) || // Matches .gov.in, .gov.pk, .gov.uk, etc.
      lowerDomain.match(/\.gob\.[a-z]{2}$/i) || // Matches .gob.mx (Mexico), .gob.pe (Peru), etc.
      lowerDomain.match(/\.gouv\.[a-z]{2}$/i); // Matches .gouv.fr (France), etc.

    // Check for country-name based government domains (e.g., canada.ca, australia.gov.au, etc.)
    const isCountryGovDomain = COUNTRY_GOV_PATTERNS.some((pattern) => pattern.test(lowerDomain));

    if (isEduDomain || isGovDomain || isCountryGovDomain) {
      const domainType = isEduDomain ? '.edu' : 'government';
      const domainIcon = isEduDomain ? '🎓' : '🏛️';
      console.log(`\n${domainIcon} SPECIAL: ${domainType} domain detected - applying trusted institution scoring`);

      // Government domains get perfect score, educational domains get high score
      let eduGovScore = isGovDomain || isCountryGovDomain ? SPECIAL_DOMAIN_SCORES.GOVERNMENT : SPECIAL_DOMAIN_SCORES.EDU_BASE;
      console.log(`  Base Score for ${domainType}: ${eduGovScore}`);

      // For .edu domains, SSL bonus applies
      if (isEduDomain && hasSSL) {
        eduGovScore += 10;
        console.log('  + SSL Certificate: +10 points');
      }

      // For .edu domains, minor penalties for serious issues
      if (isEduDomain && scamKeywords.length > 0) {
        eduGovScore -= scamKeywords.length * 2; // Minimal penalty
        console.log(`  - Unusual keywords: -${scamKeywords.length * 2} points`);
      }

      // Cap: Government domains always 100, .edu domains between 75-95
      if (isGovDomain || isCountryGovDomain) {
        eduGovScore = SPECIAL_DOMAIN_SCORES.GOVERNMENT;
      } else {
        eduGovScore = Math.max(
          SPECIAL_DOMAIN_SCORES.EDU_MIN,
          Math.min(SPECIAL_DOMAIN_SCORES.EDU_MAX, eduGovScore)
        );
      }

      console.log(`\nFinal ${domainType} Score: ${eduGovScore}`);
      console.log(
        `Reasoning: ${domainType} domains are restricted to verified ${
          isEduDomain ? 'educational institutions' : 'government entities'
        }`
      );
      console.log('=====================================\n');
      return eduGovScore;
    }
  }

  let score = SPECIAL_DOMAIN_SCORES.REGULAR_BASE; // Lower base score - more conservative approach
  console.log('\nStarting Base Score:', SPECIAL_DOMAIN_SCORES.REGULAR_BASE);
  console.log('- Registrar:', registrar);
  console.log('Starting Score:', score);

  // Domain age scoring (max 35 points) - STRICTER penalties for new domains
  if (domainAge !== null && domainAge >= 0) {
    let ageScore = 0;
    if (domainAge >= 10) {
      ageScore = 35; // Very established domain
    } else if (domainAge >= 5) {
      ageScore = 28; // Well-established domain
    } else if (domainAge >= 3) {
      ageScore = 20; // Moderately established
    } else if (domainAge >= 2) {
      ageScore = 12; // Somewhat established
    } else if (domainAge >= 1) {
      ageScore = 5; // New but not brand new
    } else if (domainAge >= 0.5) {
      ageScore = -5; // 6+ months old - still suspicious
    } else if (domainAge >= 0.25) {
      ageScore = -15; // 3-6 months - very suspicious
    } else {
      ageScore = -25; // Less than 3 months - highly suspicious
    }
    score += ageScore;
    console.log(`Domain Age Score: ${ageScore >= 0 ? '+' : ''}${ageScore} (Age: ${domainAge.toFixed(2)} years, Total: ${score})`);
  } else {
    // If we can't determine age, assume it's new and penalize
    score -= 10;
    console.log('Domain Age Score: -10 (Unable to determine, assuming new, Total:', score, ')');
  }

  // SSL scoring (max 15 points) - Less weight, it's basic nowadays
  if (hasSSL) {
    score += 15;
    console.log(`SSL Score: +15 (Total: ${score})`);
  } else {
    score -= 25;
    console.log(`SSL Score: -25 (No SSL - Major red flag, Total: ${score})`);
  }

  // Phishing detection penalty (up to -50 points) - Severe penalty
  if (phishingConfidence && phishingConfidence > 0) {
    let phishingPenalty = 0;
    if (phishingConfidence >= 80) {
      phishingPenalty = -50; // Critical phishing threat
    } else if (phishingConfidence >= 60) {
      phishingPenalty = -40; // High phishing threat
    } else if (phishingConfidence >= 40) {
      phishingPenalty = -25; // Medium phishing threat
    } else if (phishingConfidence >= 20) {
      phishingPenalty = -10; // Low phishing threat
    } else {
      phishingPenalty = -5; // Minimal phishing indicators
    }
    score += phishingPenalty;
    console.log(`Phishing Penalty: ${phishingPenalty} (Confidence: ${phishingConfidence}%, Total: ${score})`);
  }

  // Scam keywords penalty (up to -35 points)
  if (scamKeywords.length > 0) {
    const keywordPenalty = -Math.min(35, scamKeywords.length * 12);
    score += keywordPenalty;
    console.log(`Scam Keywords Penalty: ${keywordPenalty} (Found: ${scamKeywords.join(', ')}, Total: ${score})`);
  }

  // Domain length scoring - STRICTER penalties
  let lengthScore = 0;
  if (domainLength < 6) {
    lengthScore = 8; // Very short, premium domain
  } else if (domainLength < 12) {
    lengthScore = 5; // Good length
  } else if (domainLength < 18) {
    lengthScore = 0; // Acceptable length
  } else if (domainLength < 25) {
    lengthScore = -5; // Getting long
  } else if (domainLength < 35) {
    lengthScore = -12; // Very long, suspicious
  } else {
    lengthScore = -25; // Extremely long, highly suspicious
  }
  score += lengthScore;
  console.log(`Domain Length Score: ${lengthScore >= 0 ? '+' : ''}${lengthScore} (Length: ${domainLength}, Total: ${score})`);

  // Domain naming pattern analysis - MUCH STRICTER
  if (domainName) {
    const lowerDomain = domainName.toLowerCase();
    let namingScore = 0;

    // Check for suspicious patterns - MORE PENALTIES
    const suspiciousPatterns = [
      { pattern: /\d{3,}/, penalty: -15, reason: 'Contains number sequences (e.g., 24)' },
      { pattern: /\d{2}/, penalty: -8, reason: 'Contains 2-digit numbers' },
      { pattern: /\d/, penalty: -5, reason: 'Contains numbers in domain' },
      { pattern: /-{2,}/, penalty: -12, reason: 'Multiple consecutive hyphens' },
      { pattern: /--/, penalty: -8, reason: 'Double hyphens' },
      { pattern: /^[0-9]/, penalty: -10, reason: 'Starts with number' },
      { pattern: /(free|win|prize|claim|bonus|gift|lucky|deal|offer|discount|cheap|sale)/i, penalty: -15, reason: 'Promotional keywords' },
      { pattern: /(shop|store|market|buy|sell)/i, penalty: -8, reason: 'Generic shop keywords' },
      { pattern: /(login|signin|account|secure|verify|auth|update|reset)/i, penalty: -20, reason: 'Phishing keywords' },
      { pattern: /(official|real|legit|genuine|authentic|trusted|verified)/i, penalty: -15, reason: 'Over-assertive legitimacy claims' },
      { pattern: /[0o1il]{3,}/i, penalty: -12, reason: 'Character substitution pattern' },
      { pattern: /(.)\1{3,}/, penalty: -10, reason: 'Repeated characters' },
      { pattern: /(24|247|365|fast|instant|quick|best|top|super)/i, penalty: -8, reason: 'Urgency/superlative keywords' },
    ];

    suspiciousPatterns.forEach(({ pattern, penalty, reason }) => {
      if (pattern.test(lowerDomain)) {
        namingScore += penalty;
        console.log(`  - Domain Pattern: ${penalty} (${reason})`);
      }
    });

    // Check for excessive special characters
    const specialCharCount = (lowerDomain.match(/[^a-z0-9.]/g) || []).length;
    if (specialCharCount > 2) {
      namingScore -= (specialCharCount - 2) * 5;
      console.log(`  - Special Characters: -${(specialCharCount - 2) * 5} (${specialCharCount} special chars)`);
    }

    score += namingScore;
    if (namingScore !== 0) {
      console.log(`Domain Naming Score: ${namingScore >= 0 ? '+' : ''}${namingScore} (Total: ${score})`);
    }
  }

  // TLD analysis - STRICTER
  if (domainName) {
    const lowerDomain = domainName.toLowerCase();
    const trustedTLDs = ['.edu', '.gov', '.org']; // Only highly trusted
    const goodTLDs = ['.com', '.net', '.co.uk', '.us', '.ca', '.de', '.fr', '.au', '.uk', '.nl'];
    const suspiciousTLDs = SUSPICIOUS_TLDS;

    let tldScore = 0;
    const hasHighlyTrustedTLD = trustedTLDs.some((tld) => lowerDomain.endsWith(tld));
    const hasGoodTLD = goodTLDs.some((tld) => lowerDomain.endsWith(tld));
    const hasSuspiciousTLD = suspiciousTLDs.some((tld) => lowerDomain.endsWith(tld));

    if (hasHighlyTrustedTLD) {
      tldScore = 15;
      console.log(`TLD Score: +15 (Highly trusted TLD, Total: ${score + tldScore})`);
    } else if (hasGoodTLD) {
      tldScore = 5;
      console.log(`TLD Score: +5 (Common TLD, Total: ${score + tldScore})`);
    } else if (hasSuspiciousTLD) {
      tldScore = -25;
      console.log(`TLD Score: -25 (Suspicious TLD, Total: ${score + tldScore})`);
    } else {
      // Unknown TLD - penalty for obscure TLDs
      tldScore = -10;
      console.log(`TLD Score: -10 (Unknown/Uncommon TLD, Total: ${score + tldScore})`);
    }
    score += tldScore;
  }

  // Registrar reputation scoring - MORE STRICT
  if (registrar && registrar !== 'Analysis Complete') {
    const lowerRegistrar = registrar.toLowerCase();
    let registrarScore = 0;

    // Trusted major registrars (only the best)
    const trustedRegistrars = [
      'google domains',
      'cloudflare',
      'amazon registrar',
      'microsoft',
      'godaddy',
      'namecheap',
      'gandi',
      'enom',
      'network solutions',
    ];

    // Moderate registrars (less bonus)
    const moderateRegistrars = [
      'name.com',
      'hover',
      '1&1',
      'tucows',
      'bluehost',
      'hostgator',
      'domain.com',
      'register.com',
      'inwx',
      'dynadot',
      'ionos',
      'ovh',
      'key-systems',
    ];

    // Registrars often associated with abuse
    const suspiciousRegistrars = [
      'freenom',
      'dot.tk',
      'namecheap basic',
      'pdr',
      'wildwestdomains',
      'registrar of domain names',
      'bizcn',
      'alibaba',
      'hangzhou',
      'eranet',
      'onlinenic',
      'west263',
      'xin net',
      'hichina',
      'nicenic',
      'cheap',
      'discount',
      'free',
      'domains by proxy', // Privacy services can hide scammers
    ];

    const isTrusted = trustedRegistrars.some((trusted) => lowerRegistrar.includes(trusted));
    const isModerate = moderateRegistrars.some((moderate) => lowerRegistrar.includes(moderate));
    const isSuspicious = suspiciousRegistrars.some((suspicious) => lowerRegistrar.includes(suspicious));

    if (isTrusted) {
      registrarScore = 10;
      console.log(`Registrar Score: +10 (Trusted registrar: ${registrar}, Total: ${score + registrarScore})`);
    } else if (isModerate) {
      registrarScore = 5;
      console.log(`Registrar Score: +5 (Moderate registrar: ${registrar}, Total: ${score + registrarScore})`);
    } else if (isSuspicious) {
      registrarScore = -25;
      console.log(`Registrar Score: -25 (High-risk registrar: ${registrar}, Total: ${score + registrarScore})`);
    } else if (lowerRegistrar.length > 5) {
      // Unknown registrar - be cautious
      registrarScore = -5;
      console.log(`Registrar Score: -5 (Unknown registrar: ${registrar}, Total: ${score + registrarScore})`);
    }

    score += registrarScore;
  } else if (registrar === null || registrar === 'Analysis Complete') {
    // Missing registrar information - penalty (hiding info is suspicious)
    score -= 10;
    console.log(`Registrar Score: -10 (No registrar information, Total: ${score})`);
  }

  // Organization/registrant information scoring (up to +15 points)
  // Having visible organization information shows transparency and legitimacy
  if (organization && organization.trim().length > 0) {
    // Filter out privacy protection services and generic placeholders
    const lowerOrg = organization.toLowerCase();
    const privacyServices = [
      'privacy', 'protected', 'redacted', 'whois', 'guard', 'proxy',
      'not disclosed', 'data protected', 'gdpr', 'withheld', 'contact privacy',
      'domains by proxy', 'whoisguard', 'perfect privacy', 'private registration'
    ];
    
    const isPrivacyProtected = privacyServices.some(service => lowerOrg.includes(service));
    
    if (!isPrivacyProtected) {
      // Real organization name found - positive trust signal
      let orgScore = 0;
      
      if (organization.length > 50) {
        // Very detailed organization info
        orgScore = 15;
        console.log(`Organization Score: +15 (Detailed organization information: ${organization}, Total: ${score + orgScore})`);
      } else if (organization.length > 20) {
        // Good organization info
        orgScore = 12;
        console.log(`Organization Score: +12 (Organization information: ${organization}, Total: ${score + orgScore})`);
      } else if (organization.length > 5) {
        // Basic organization info
        orgScore = 8;
        console.log(`Organization Score: +8 (Basic organization name: ${organization}, Total: ${score + orgScore})`);
      } else {
        // Minimal but present
        orgScore = 5;
        console.log(`Organization Score: +5 (Minimal organization info, Total: ${score + orgScore})`);
      }
      
      score += orgScore;
    } else {
      // Privacy-protected organization - slight penalty for lack of transparency
      score -= 5;
      console.log(`Organization Score: -5 (Privacy-protected organization info, Total: ${score})`);
    }
  } else {
    // No organization information - minor penalty for lack of transparency
    score -= 8;
    console.log(`Organization Score: -8 (No organization information, Total: ${score})`);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  console.log(`Final Score (clamped 0-100): ${finalScore}`);
  console.log('===================================');

  return finalScore;
};

/**
 * Get verdict based on trust score
 */
export const getVerdict = (
  score: number
): { verdict: string; color: string; bgColor: string } => {
  if (score >= 80) {
    return {
      verdict: 'Highly Trustworthy',
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
    };
  } else if (score >= 60) {
    return {
      verdict: 'Likely Safe',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
    };
  } else if (score >= 40) {
    return {
      verdict: 'Use Caution',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
    };
  } else {
    return {
      verdict: 'High Risk - Avoid',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
    };
  }
};
