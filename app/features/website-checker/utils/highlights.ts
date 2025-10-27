/**
 * Trust highlights generation utilities
 */

import { COUNTRY_GOV_MAPPING } from '../constants';
import type { PhishingDetection, TrustHighlights } from '../types';

/**
 * Generate trust highlights based on analysis
 */
export const generateTrustHighlights = (
  trustScore: number,
  hasSSL: boolean,
  domainAge: number | null,
  scamKeywords: string[],
  phishingInfo?: PhishingDetection,
  domainName?: string,
  organization?: string | null
): TrustHighlights => {
  const positiveHighlights: string[] = [];
  const negativeHighlights: string[] = [];

  // Special handling for .edu and government domains
  if (domainName) {
    const lowerDomain = domainName.toLowerCase();

    // Check for country-name based government domains first
    const countryGovName = COUNTRY_GOV_MAPPING[lowerDomain];
    if (countryGovName) {
      positiveHighlights.push(`🏛️ This is the official government website of ${countryGovName}`);
      positiveHighlights.push('This domain is operated by the official government and is highly trustworthy');
      positiveHighlights.push('Government websites are strictly regulated and secure');
    } else if (lowerDomain.endsWith('.edu')) {
      positiveHighlights.push(
        '🎓 This is a .edu domain - restricted to accredited educational institutions only'
      );
      positiveHighlights.push('Educational domains undergo strict verification before issuance');
      positiveHighlights.push('.edu domains are highly regulated and trustworthy');
    } else if (lowerDomain.endsWith('.gov')) {
      positiveHighlights.push('🏛️ This is a .gov domain - restricted to official US government entities only');
      positiveHighlights.push('Government domains are strictly controlled and verified');
      positiveHighlights.push('.gov domains represent official government websites');
    } else if (lowerDomain.match(/\.gov\.[a-z]{2,3}$/i)) {
      // Country-specific government domains like .gov.in, .gov.pk, .gov.uk, etc.
      const countryMatch = lowerDomain.match(/\.gov\.([a-z]{2,3})$/i);
      const countryCode = countryMatch ? countryMatch[1].toUpperCase() : 'this country';
      positiveHighlights.push(
        `🏛️ This is a ${countryCode} government domain (.gov.${countryMatch?.[1]}) - restricted to official government entities`
      );
      positiveHighlights.push('Country-specific government domains are strictly regulated and verified');
      positiveHighlights.push('These domains represent official government websites');
    } else if (lowerDomain.match(/\.gob\.[a-z]{2}$/i)) {
      // Spanish/Portuguese speaking countries use .gob (gobierno/governo)
      const countryMatch = lowerDomain.match(/\.gob\.([a-z]{2})$/i);
      const countryCode = countryMatch ? countryMatch[1].toUpperCase() : 'this country';
      positiveHighlights.push(
        `🏛️ This is a ${countryCode} government domain (.gob.${countryMatch?.[1]}) - restricted to official government entities`
      );
      positiveHighlights.push('Government domains are strictly controlled and verified');
      positiveHighlights.push('These domains represent official government websites');
    } else if (lowerDomain.match(/\.gouv\.[a-z]{2}$/i)) {
      // French-speaking countries use .gouv (gouvernement)
      const countryMatch = lowerDomain.match(/\.gouv\.([a-z]{2})$/i);
      const countryCode = countryMatch ? countryMatch[1].toUpperCase() : 'this country';
      positiveHighlights.push(
        `🏛️ This is a ${countryCode} government domain (.gouv.${countryMatch?.[1]}) - restricted to official government entities`
      );
      positiveHighlights.push('Government domains are strictly controlled and verified');
      positiveHighlights.push('These domains represent official government websites');
    }
  }

  // Positive highlights
  if (hasSSL) {
    positiveHighlights.push('We found a valid SSL certificate');
  }

  if (domainAge !== null) {
    if (domainAge >= 5) {
      positiveHighlights.push(
        `This website has been active for ${domainAge.toFixed(1)} years, indicating established presence`
      );
    } else if (domainAge >= 2) {
      positiveHighlights.push(`Domain has been registered for ${domainAge.toFixed(1)} years`);
    }
  }

  if (scamKeywords.length === 0) {
    positiveHighlights.push('No obvious scam-related keywords were detected in the domain name');
  }

  if (!phishingInfo?.isPhishing) {
    positiveHighlights.push('Our phishing detection system did not identify this as a phishing attempt');
  }

  // Organization/registrant information highlights
  if (organization && organization.trim().length > 0) {
    const lowerOrg = organization.toLowerCase();
    const privacyServices = [
      'privacy', 'protected', 'redacted', 'whois', 'guard', 'proxy',
      'not disclosed', 'data protected', 'gdpr', 'withheld', 'contact privacy',
      'domains by proxy', 'whoisguard', 'perfect privacy', 'private registration'
    ];
    
    const isPrivacyProtected = privacyServices.some(service => lowerOrg.includes(service));
    
    if (!isPrivacyProtected) {
      positiveHighlights.push(`Organization information is publicly available, showing transparency`);
    }
  }

  if (trustScore >= 80) {
    positiveHighlights.push('The website shows multiple positive trust signals');
  }

  // Negative highlights
  if (!hasSSL) {
    negativeHighlights.push('The website does not have a valid SSL certificate, which is concerning for security');
  }

  if (domainAge !== null) {
    if (domainAge < 0.5) {
      negativeHighlights.push('The age of this site is very young (less than 6 months old)');
    } else if (domainAge < 1) {
      negativeHighlights.push(
        'This is a relatively new domain (less than 1 year old), which requires extra caution'
      );
    }
  }

  if (scamKeywords.length > 0) {
    negativeHighlights.push(
      `The domain contains ${scamKeywords.length} suspicious keyword${
        scamKeywords.length > 1 ? 's' : ''
      } commonly associated with scams`
    );
  }

  if (phishingInfo?.isPhishing) {
    negativeHighlights.push(
      `Our AI detected this as a potential phishing site with ${phishingInfo.confidence}% confidence`
    );
    if (phishingInfo.likelyTarget) {
      negativeHighlights.push(`This site may be impersonating ${phishingInfo.likelyTarget}`);
    }
  }

  // Organization/registrant information negative highlights
  if (!organization || organization.trim().length === 0) {
    negativeHighlights.push('No organization information is publicly available, which reduces transparency');
  } else {
    const lowerOrg = organization.toLowerCase();
    const privacyServices = [
      'privacy', 'protected', 'redacted', 'whois', 'guard', 'proxy',
      'not disclosed', 'data protected', 'gdpr', 'withheld', 'contact privacy'
    ];
    
    const isPrivacyProtected = privacyServices.some(service => lowerOrg.includes(service));
    
    if (isPrivacyProtected) {
      negativeHighlights.push('Organization information is hidden behind privacy protection services');
    }
  }

  if (trustScore < 40) {
    negativeHighlights.push('The overall trust score is critically low, indicating high risk');
  } else if (trustScore < 60) {
    negativeHighlights.push('The trust score suggests limited positive signals about this website');
  }

  // Ensure we have at least some highlights
  if (positiveHighlights.length === 0) {
    positiveHighlights.push('Limited positive information available about this website');
  }

  if (negativeHighlights.length === 0 && trustScore >= 70) {
    negativeHighlights.push('No major red flags detected during our analysis');
  }

  return {
    positive: positiveHighlights,
    negative: negativeHighlights,
  };
};
