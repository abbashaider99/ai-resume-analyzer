/**
 * Constants and patterns for Website Security Checker
 */

/**
 * Government domain patterns for regex matching
 */
export const COUNTRY_GOV_PATTERNS = [
  /^(www\.)?canada\.ca$/i,           // Canada
  /^(www\.)?australia\.gov\.au$/i,   // Australia  
  /^(www\.)?govt\.nz$/i,             // New Zealand
  /^(www\.)?india\.gov\.in$/i,       // India
  /^(www\.)?usa\.gov$/i,             // USA
  /^(www\.)?gov\.uk$/i,              // UK
  /^(www\.)?government\.[a-z]{2,3}$/i, // Generic government.XX
  /^(www\.)?gc\.ca$/i,               // Government of Canada (GC)
  /^(www\.)?service\.gov\.uk$/i,     // UK Government Services
];

/**
 * Mapping of country government domains to friendly country names
 */
export const COUNTRY_GOV_MAPPING: { [key: string]: string } = {
  'canada.ca': 'Canada',
  'www.canada.ca': 'Canada',
  'gc.ca': 'Canada (Government of Canada)',
  'www.gc.ca': 'Canada (Government of Canada)',
  'australia.gov.au': 'Australia',
  'www.australia.gov.au': 'Australia',
  'govt.nz': 'New Zealand',
  'www.govt.nz': 'New Zealand',
  'india.gov.in': 'India',
  'www.india.gov.in': 'India',
  'usa.gov': 'United States',
  'www.usa.gov': 'United States',
  'gov.uk': 'United Kingdom',
  'www.gov.uk': 'United Kingdom',
  'service.gov.uk': 'United Kingdom',
  'www.service.gov.uk': 'United Kingdom',
};

/**
 * List of country government domain names for checking
 */
export const COUNTRY_GOV_DOMAINS = [
  'canada.ca', 
  'gc.ca', 
  'australia.gov.au', 
  'govt.nz', 
  'india.gov.in', 
  'usa.gov', 
  'gov.uk', 
  'service.gov.uk'
];

/**
 * Trusted TLDs that get higher scores
 */
export const TRUSTED_TLDS = [
  '.gov', '.edu', '.mil', '.org'
];

/**
 * Suspicious TLDs that might indicate higher risk
 */
export const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.loan', '.review'
];

/**
 * Keywords that might indicate scam attempts
 */
export const SCAM_KEYWORDS = [
  'free-money', 'win-prize', 'claim-reward', 'verify-account',
  'urgent-action', 'limited-time', 'act-now', 'congratulations',
  'winner', 'lottery', 'inheritance', 'refund'
];

/**
 * Trusted registrars (domain registrars known to be legitimate)
 */
export const TRUSTED_REGISTRARS = [
  'GoDaddy', 'Namecheap', 'Google Domains', 'Cloudflare', 
  'AWS', 'Amazon', 'Microsoft', 'Network Solutions'
];

/**
 * Trust score thresholds
 */
export const TRUST_SCORE_THRESHOLDS = {
  VERY_HIGH: 80,
  HIGH: 60,
  MEDIUM: 40,
  LOW: 20,
};

/**
 * Special domain scoring
 */
export const SPECIAL_DOMAIN_SCORES = {
  GOVERNMENT: 100,
  EDU_BASE: 85,
  EDU_MAX: 95,
  EDU_MIN: 75,
  REGULAR_BASE: 35,
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  RDAP_VERISIGN: 'https://rdap.verisign.com/com/v1/domain/',
  RDAP_ORG: 'https://rdap.org/domain/',
  WHOIS_API: 'https://who.is/whois/',
  IPWHOIS_API: 'https://ipwhois.app/json/',
};

/**
 * Timeout configurations (in milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: 10000,
  SSL_CHECK: 5000,
};
