/**
 * Validation utilities for URL and SSL checks
 */

/**
 * Analyze SSL status of a URL
 */
export const analyzeSSL = (urlString: string): { hasSSL: boolean; message: string } => {
  const hasHTTPS = urlString.toLowerCase().startsWith('https://');
  return {
    hasSSL: hasHTTPS,
    message: hasHTTPS ? 'SSL certificate detected' : 'No SSL certificate (HTTP only)',
  };
};

/**
 * Validate URL format
 */
export const validateURL = (url: string): { isValid: boolean; error?: string } => {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    // Add protocol if missing
    let urlToValidate = url.trim();
    if (!/^https?:\/\//i.test(urlToValidate)) {
      urlToValidate = 'https://' + urlToValidate;
    }

    const urlObj = new URL(urlToValidate);

    // Basic validation
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Extract clean domain name from URL
 */
export const extractDomain = (url: string): string => {
  try {
    let urlToProcess = url.trim();
    if (!/^https?:\/\//i.test(urlToProcess)) {
      urlToProcess = 'https://' + urlToProcess;
    }

    const urlObj = new URL(urlToProcess);
    return urlObj.hostname.replace(/^www\./i, '');
  } catch (error) {
    return url;
  }
};

/**
 * Calculate domain age in years from registration date
 */
export const calculateDomainAge = (registrationDate: string): number | null => {
  if (!registrationDate || registrationDate === 'Information not available') {
    return null;
  }

  try {
    const regDate = new Date(registrationDate);
    const now = new Date();
    const ageInYears = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears;
  } catch (error) {
    return null;
  }
};
