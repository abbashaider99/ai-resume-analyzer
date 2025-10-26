import { useEffect, useRef, useState } from "react";
import Navbar from "~/components/Navbar";

export const meta = () => [
  { title: "Website Legitimacy Checker - AI-Powered Security Analysis | Abbas Logic" },
  {
    name: "description",
    content:
      "Check if a website is safe and legitimate using AI-powered analysis. Get trust scores, safety recommendations, and detailed security insights.",
  },
];

interface WebsiteAnalysis {
  trustScore: number;
  verdict: string;
  verdictColor: string;
  verdictBgColor: string;
  reasons: string[];
  safetyTips: string[];
  domainAge?: string;
  sslStatus?: string;
  registrar?: string;
  domainName?: string;
  protocol?: string;
  lastChecked?: string;
  registrationDate?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  registrantContact?: string | null;
  nameservers?: string[];
  phishingDetection?: {
    isPhishing: boolean;
    confidence: number;
    patterns: string[];
    likelyTarget?: string;
  };
  userReports?: {
    totalReports: number;
    positiveReports: number;
    negativeReports: number;
    commonComplaints: string[];
    trustRating?: number;
  };
  aiTrustAnalysis?: {
    trustLikelihood: number;
    riskLevel: string;
    riskColor: string;
    aiInsights: string[];
    domainCharacteristics: {
      label: string;
      status: string;
      statusColor: string;
    }[];
    recommendation: string;
  };
  externalReports?: {
    source: string;
    name: string;
    url: string;
    rating?: string;
    description?: string;
    icon?: string;
  }[];
  trustHighlights?: {
    positive: string[];
    negative: string[];
  };
}

interface ValidationErrors {
  url?: string;
}

export default function WebsiteChecker() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  // Live pricing state (for unregistered domains)
  const [pricingOffers, setPricingOffers] = useState<
    | null
    | Array<{ provider: string; url: string; price: string | null; offer: string | null; freebies?: string[] }>
  >(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  // Deprecated secondary pricing cache (removed to avoid duplication)
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to results when analysis completes
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

  // Fetch live pricing when domain appears unregistered
  useEffect(() => {
    const isUnregistered =
      result && result.registrationDate === "Information not available" && result.domainAge === "Information not available";
    if (!isUnregistered || !result?.domainName) {
      setPricingOffers(null);
      setPricingLoading(false);
      setPricingError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setPricingLoading(true);
        setPricingError(null);
        const res = await fetch(`/api.pricing?domain=${encodeURIComponent(result.domainName!)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setPricingOffers(Array.isArray(data?.offers) ? data.offers : null);
        }
      } catch (e: any) {
        if (!cancelled) setPricingError(e?.message || "Failed to load pricing");
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result?.domainName, result?.registrationDate, result?.domainAge]);

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-section, #print-section * {
          visibility: visible;
        }
        #print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        .print-break {
          page-break-after: always;
        }
        .print\\:block {
          display: block !important;
        }
        /* Remove shadows and rounded corners for print */
        #print-section * {
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        /* Adjust colors for better print quality */
        .bg-gradient-to-r, .bg-gradient-to-br {
          background: #000 !important;
          color: #fff !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // NOTE: removed duplicate /api/pricing fetch; we already fetch from /api.pricing above

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setErrors({ url: "Please enter a website URL" });
      return false;
    }

    // Basic URL validation
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(urlString)) {
        setErrors({ url: "Please enter a valid website URL" });
        return false;
      }
    } catch {
      setErrors({ url: "Invalid URL format" });
      return false;
    }

    setErrors({});
    return true;
  };

  const checkForScamKeywords = (domain: string): string[] => {
    const scamKeywords = [
      'free', 'win', 'prize', 'lottery', 'claim', 'urgent', 
      'verify', 'account', 'suspended', 'bitcoin', 'crypto-invest',
      'paypal', 'secure', 'update', 'confirm', 'banking'
    ];
    
    const foundKeywords: string[] = [];
    const lowerDomain = domain.toLowerCase();
    
    scamKeywords.forEach(keyword => {
      if (lowerDomain.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    return foundKeywords;
  };

  const detectPhishingPatterns = (domain: string): { 
    isPhishing: boolean; 
    confidence: number; 
    patterns: string[];
    likelyTarget?: string;
  } => {
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
      { name: 'whatsapp', variants: ['whatsap', 'what5app', 'whats-app', 'whatsaap'] }
    ];

    // Check for suspicious characters
    if (/[0-9]/.test(lowerDomain.replace(/\d{4,}/, ''))) { // Numbers replacing letters
      patterns.push('Contains numbers that may replace letters');
      confidence += 15;
    }

    // Check for excessive hyphens
    if ((lowerDomain.match(/-/g) || []).length > 2) {
      patterns.push('Excessive use of hyphens');
      confidence += 10;
    }

    // Check for homograph attacks (Unicode lookalikes)
    if (/[а-яА-Я]/.test(domain)) { // Cyrillic characters
      patterns.push('Contains Cyrillic characters that look like Latin');
      confidence += 25;
    }

    // Check for brand impersonation
    popularBrands.forEach(brand => {
      // Check for exact brand name with extra parts
      if (lowerDomain.includes(brand.name) && lowerDomain !== brand.name && !lowerDomain.endsWith(brand.name + '.com')) {
        const hasExtraPrefix = lowerDomain.startsWith(brand.name + '-') || 
                               lowerDomain.startsWith(brand.name + '_') ||
                               lowerDomain.includes('-' + brand.name) ||
                               lowerDomain.includes('_' + brand.name);
        
        if (hasExtraPrefix || lowerDomain.includes(brand.name + '-') || lowerDomain.includes(brand.name + 'secure')) {
          patterns.push(`Appears to impersonate ${brand.name.charAt(0).toUpperCase() + brand.name.slice(1)}`);
          likelyTarget = brand.name.charAt(0).toUpperCase() + brand.name.slice(1);
          confidence += 30;
        }
      }

      // Check for variant spellings
      brand.variants.forEach(variant => {
        if (lowerDomain.includes(variant)) {
          patterns.push(`Suspicious spelling variation of ${brand.name.charAt(0).toUpperCase() + brand.name.slice(1)}`);
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
    suspiciousCombinations.forEach(word => {
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
      likelyTarget: likelyTarget || undefined
    };
  };

  const analyzeSSL = (urlString: string): { hasSSL: boolean; message: string } => {
    const hasHTTPS = urlString.toLowerCase().startsWith('https://');
    return {
      hasSSL: hasHTTPS,
      message: hasHTTPS ? "SSL certificate detected" : "No SSL certificate (HTTP only)"
    };
  };

  const calculateTrustScore = (
    domainAge: number | null,
    hasSSL: boolean,
    scamKeywords: string[],
    domainLength: number,
    phishingConfidence?: number,
    domainName?: string,
    registrar?: string | null
  ): number => {
    let score = 35; // Lower base score - more conservative approach like ScamAdviser

    console.log('=== Trust Score Calculation Debug ===');
    console.log('Input Parameters:');
    console.log('- Domain Age:', domainAge, 'years');
    console.log('- Has SSL:', hasSSL);
    console.log('- Scam Keywords:', scamKeywords);
    console.log('- Domain Length:', domainLength);
    console.log('- Phishing Confidence:', phishingConfidence);
    console.log('- Domain Name:', domainName);
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
        ageScore = -25; // Less than 3 months - highly suspicious (like flipshop24)
      }
      score += ageScore;
      console.log(`Domain Age Score: ${ageScore >= 0 ? '+' : ''}${ageScore} (Age: ${domainAge.toFixed(2)} years, Total: ${score})`);
    } else {
      // If we can't determine age, assume it's new and penalize
      score -= 10;
      console.log('Domain Age Score: -10 (Unable to determine, assuming new, Total:', score + ')');
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
        { pattern: /\d{3,}/, penalty: -15, reason: 'Contains number sequences (e.g., 24)' }, // Catches "24" in flipshop24
        { pattern: /\d{2}/, penalty: -8, reason: 'Contains 2-digit numbers' }, // Additional penalty for 2 digits
        { pattern: /\d/, penalty: -5, reason: 'Contains numbers in domain' }, // ANY number is suspicious
        { pattern: /-{2,}/, penalty: -12, reason: 'Multiple consecutive hyphens' },
        { pattern: /--/, penalty: -8, reason: 'Double hyphens' },
        { pattern: /^[0-9]/, penalty: -10, reason: 'Starts with number' },
        { pattern: /(free|win|prize|claim|bonus|gift|lucky|deal|offer|discount|cheap|sale)/i, penalty: -15, reason: 'Promotional keywords' },
        { pattern: /(shop|store|market|buy|sell)/i, penalty: -8, reason: 'Generic shop keywords' }, // flipshop = suspicious
        { pattern: /(login|signin|account|secure|verify|auth|update|reset)/i, penalty: -20, reason: 'Phishing keywords' },
        { pattern: /(official|real|legit|genuine|authentic|trusted|verified)/i, penalty: -15, reason: 'Over-assertive legitimacy claims' },
        { pattern: /[0o1il]{3,}/i, penalty: -12, reason: 'Character substitution pattern' },
        { pattern: /(.)\1{3,}/, penalty: -10, reason: 'Repeated characters' },
        { pattern: /(24|247|365|fast|instant|quick|best|top|super)/i, penalty: -8, reason: 'Urgency/superlative keywords' }, // "24" in flipshop24
      ];

      suspiciousPatterns.forEach(({ pattern, penalty, reason }) => {
        if (pattern.test(lowerDomain)) {
          namingScore += penalty;
          console.log(`  - Domain Pattern: ${penalty} (${reason})`);
        }
      });

      // REMOVED positive patterns - domains need to EARN trust, not get bonuses

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
      const goodTLDs = ['.com', '.net', '.co.uk', '.us', '.ca', '.de', '.fr', '.au', '.uk', '.nl']; // Common but not fully trusted
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.info', '.work', '.click', '.link', '.pw', '.cc', '.ws', '.biz'];
      
      let tldScore = 0;
      const hasHighlyTrustedTLD = trustedTLDs.some(tld => lowerDomain.endsWith(tld));
      const hasGoodTLD = goodTLDs.some(tld => lowerDomain.endsWith(tld));
      const hasSuspiciousTLD = suspiciousTLDs.some(tld => lowerDomain.endsWith(tld));
      
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
    if (registrar && registrar !== "Analysis Complete") {
      const lowerRegistrar = registrar.toLowerCase();
      let registrarScore = 0;

      // Trusted major registrars (only the best)
      const trustedRegistrars = [
        'google domains', 'cloudflare', 'amazon registrar', 'microsoft',
        'godaddy', 'namecheap', 'gandi', 'enom', 'network solutions'
      ];

      // Moderate registrars (less bonus)
      const moderateRegistrars = [
        'name.com', 'hover', '1&1', 'tucows', 'bluehost',
        'hostgator', 'domain.com', 'register.com', 'inwx', 'dynadot',
        'ionos', 'ovh', 'key-systems'
      ];

      // Registrars often associated with abuse
      const suspiciousRegistrars = [
        'freenom', 'dot.tk', 'namecheap basic', 'pdr', 'wildwestdomains',
        'registrar of domain names', 'bizcn', 'alibaba', 'hangzhou',
        'eranet', 'onlinenic', 'west263', 'xin net', 'hichina', 'nicenic',
        'cheap', 'discount', 'free', 'domains by proxy' // Privacy services can hide scammers
      ];

      const isTrusted = trustedRegistrars.some(trusted => lowerRegistrar.includes(trusted));
      const isModerate = moderateRegistrars.some(moderate => lowerRegistrar.includes(moderate));
      const isSuspicious = suspiciousRegistrars.some(suspicious => lowerRegistrar.includes(suspicious));

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
    } else if (registrar === null || registrar === "Analysis Complete") {
      // Missing registrar information - penalty (hiding info is suspicious)
      score -= 10;
      console.log(`Registrar Score: -10 (No registrar information, Total: ${score})`);
    }

    const finalScore = Math.max(0, Math.min(100, score));
    console.log(`Final Score (clamped 0-100): ${finalScore}`);
    console.log('===================================');

    return finalScore;
  };

  const getVerdict = (score: number): { verdict: string; color: string; bgColor: string } => {
    if (score >= 80) {
      return {
        verdict: "Highly Trustworthy",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (score >= 60) {
      return {
        verdict: "Likely Safe",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200"
      };
    } else if (score >= 40) {
      return {
        verdict: "Use Caution",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50 border-yellow-200"
      };
    } else {
      return {
        verdict: "High Risk - Avoid",
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200"
      };
    }
  };

  const generateAIAnalysis = async (
    urlString: string,
    trustScore: number,
    scamKeywords: string[],
    sslStatus: string,
    phishingInfo?: { isPhishing: boolean; confidence: number; patterns: string[]; likelyTarget?: string }
  ): Promise<{ reasons: string[]; safetyTips: string[] }> => {
    try {
      // Check if Puter AI is available
      if (typeof window !== 'undefined' && window.puter?.ai) {
        const phishingContext = phishingInfo?.isPhishing 
          ? `\n⚠️ PHISHING DETECTED (${phishingInfo.confidence}% confidence)
Suspicious Patterns: ${phishingInfo.patterns.join(', ')}
${phishingInfo.likelyTarget ? `Likely impersonating: ${phishingInfo.likelyTarget}` : ''}`
          : '';

        const prompt = `Analyze this website for legitimacy: ${urlString}
        
Trust Score: ${trustScore}/100
SSL Status: ${sslStatus}
Suspicious Keywords Found: ${scamKeywords.length > 0 ? scamKeywords.join(', ') : 'None'}${phishingContext}

Please provide:
1. 3-5 specific reasons for the trust score (be concise)${phishingInfo?.isPhishing ? ' - EMPHASIZE the phishing risk' : ''}
2. 3-5 practical safety tips for users

Format your response as JSON:
{
  "reasons": ["reason 1", "reason 2", ...],
  "safetyTips": ["tip 1", "tip 2", ...]
}`;

        const response = await window.puter.ai.chat(prompt);
        
        try {
          // Try to parse JSON response
          const responseText = typeof response === 'string' ? response : JSON.stringify(response);
          const parsed = JSON.parse(responseText);
          
          if (parsed.reasons && parsed.reasons.length > 0 && parsed.safetyTips && parsed.safetyTips.length > 0) {
            console.log("AI Analysis successful:", parsed);
            return {
              reasons: parsed.reasons,
              safetyTips: parsed.safetyTips
            };
          }
        } catch (parseError) {
          // If not JSON, parse the text response
          console.log("Failed to parse as JSON, trying text parsing");
          const responseText = typeof response === 'string' ? response : JSON.stringify(response);
          const textResult = parseAITextResponse(responseText);
          
          if (textResult.reasons.length > 0 && textResult.safetyTips.length > 0) {
            return textResult;
          }
        }
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    }

    // Always use fallback to ensure data is returned
    console.log("Using fallback analysis");
    return generateFallbackAnalysis(trustScore, scamKeywords, sslStatus);
  };

  const parseAITextResponse = (response: string): { reasons: string[]; safetyTips: string[] } => {
    const reasons: string[] = [];
    const safetyTips: string[] = [];
    
    const lines = response.split('\n').filter(line => line.trim());
    let currentSection: 'reasons' | 'tips' | null = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('reason')) {
        currentSection = 'reasons';
      } else if (trimmed.toLowerCase().includes('tip') || trimmed.toLowerCase().includes('safety')) {
        currentSection = 'tips';
      } else if (trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        const text = trimmed.replace(/^[-\d.)\s]+/, '').trim();
        if (text && currentSection === 'reasons') {
          reasons.push(text);
        } else if (text && currentSection === 'tips') {
          safetyTips.push(text);
        }
      }
    });
    
    return { reasons, safetyTips };
  };

  const generateFallbackAnalysis = (
    trustScore: number,
    scamKeywords: string[],
    sslStatus: string
  ): { reasons: string[]; safetyTips: string[] } => {
    const reasons: string[] = [];
    const safetyTips: string[] = [];

    // Generate reasons based on score
    if (trustScore >= 70) {
      reasons.push("Website appears to have an established online presence");
      if (sslStatus.includes("detected")) {
        reasons.push("Secure HTTPS connection is enabled for encrypted data transmission");
      }
      if (scamKeywords.length === 0) {
        reasons.push("No suspicious keywords detected in domain name");
      }
      reasons.push("Trust score indicates a relatively safe website");
      reasons.push("Domain structure follows standard naming conventions");
    } else if (trustScore >= 50) {
      reasons.push("Website shows mixed security indicators - proceed with caution");
      if (!sslStatus.includes("detected")) {
        reasons.push("⚠️ Missing HTTPS/SSL security certificate - data is not encrypted");
      }
      if (scamKeywords.length > 0) {
        reasons.push(`⚠️ Domain contains ${scamKeywords.length} suspicious keyword(s): ${scamKeywords.join(', ')}`);
      }
      reasons.push("Further verification recommended before sharing sensitive information");
    } else {
      reasons.push("⚠️ Website shows multiple risk indicators - high caution advised");
      if (!sslStatus.includes("detected")) {
        reasons.push("❌ No SSL certificate detected - data transmission is not encrypted");
      }
      if (scamKeywords.length > 0) {
        reasons.push(`❌ High-risk keywords found in domain: ${scamKeywords.join(', ')}`);
      }
      reasons.push("❌ Low trust score indicates potential security concerns");
      reasons.push("Strongly recommended to avoid entering personal or financial information");
    }

    // Generate safety tips
    safetyTips.push("🔒 Never share passwords or financial information unless you're absolutely certain of legitimacy");
    safetyTips.push("🔍 Look for contact information, privacy policy, and terms of service on the website");
    safetyTips.push("⭐ Check online reviews and ratings from trusted sources like Trustpilot or BBB");
    safetyTips.push("🛡️ Use antivirus software and keep your browser security features enabled");
    
    if (!sslStatus.includes("detected")) {
      safetyTips.push("⚠️ Avoid entering sensitive data on non-HTTPS websites - your information could be intercepted");
    }
    
    if (trustScore < 60) {
      safetyTips.push("✅ Consider using alternative, well-known websites for similar services");
    }

    if (scamKeywords.length > 0) {
      safetyTips.push("🚨 Be extra vigilant - suspicious keywords detected in domain name");
    }

    return { reasons, safetyTips };
  };

  // Pricing and offers for unregistered domains
  interface DomainOffer {
    provider: string;
    url: string;
    // Optional indicative pricing (estimates). We prefer live pricing on provider pages.
    typical?: string; // e.g. "~$9.99/yr for .com"
    renewal?: string; // e.g. "~$15.99/yr"
    freebies?: string[]; // included features, e.g. ["WHOIS Privacy", "SSL"]
    badge?: string; // e.g. "Best Deal"
    highlight?: boolean; // visually emphasize
  }

  const getTld = (domain: string): string => {
    if (!domain) return '';
    const lower = domain.toLowerCase();
    if (lower.endsWith('.co.uk')) return 'co.uk';
    const parts = lower.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  };

  const getDomainPricing = (domain: string): DomainOffer[] => {
    const tld = getTld(domain);
    // Baseline pricing map (estimates). In production, fetch live pricing from providers.
    const base: Record<string, { h: number; nc: number; gd: number; renewH?: number; renewNC?: number; renewGD?: number }> = {
      'com': { h: 9.99, nc: 10.98, gd: 11.99, renewH: 15.99, renewNC: 15.98, renewGD: 21.99 },
      'net': { h: 12.99, nc: 13.98, gd: 14.99, renewH: 16.99, renewNC: 16.98, renewGD: 22.99 },
      'org': { h: 11.99, nc: 11.98, gd: 12.99, renewH: 15.99, renewNC: 15.98, renewGD: 21.99 },
      'io': { h: 39.99, nc: 44.98, gd: 59.99, renewH: 44.99, renewNC: 54.98, renewGD: 69.99 },
      'ai': { h: 59.99, nc: 69.98, gd: 69.99, renewH: 69.99, renewNC: 79.98, renewGD: 79.99 },
      'co.uk': { h: 6.99, nc: 7.98, gd: 7.99, renewH: 9.99, renewNC: 10.98, renewGD: 11.99 },
    };
    const fallback = { h: 9.99, nc: 10.99, gd: 12.99, renewH: 14.99, renewNC: 14.99, renewGD: 19.99 };
    const row = base[tld] || fallback;

  const format = (n?: number) => (n ? `$${n.toFixed(2)}/yr` : undefined);
  const typicalLabel = (n?: number) => (n ? `~${format(n)} for .${tld || 'com'}` : undefined);

    const hostingerUrl = `https://www.hostinger.com/domain-name-results?domain=${encodeURIComponent(domain)}&REFERRALCODE=1TEAMTECH21&from=domain-name-search`;
    const namecheapUrl = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(domain)}`;

    return [
      {
        provider: 'Hostinger',
        url: hostingerUrl,
        typical: typicalLabel(row.h),
        renewal: typicalLabel(row.renewH),
        freebies: ['WHOIS Privacy', 'SSL Support', '1-Click DNS'],
        badge: 'Best Value',
        highlight: true,
      },
      {
        provider: 'Namecheap',
        url: namecheapUrl,
        typical: typicalLabel(row.nc),
        renewal: typicalLabel(row.renewNC),
        freebies: ['WHOIS Privacy', 'Email Forwarding'],
        badge: 'Popular',
      },
      {
        provider: 'GoDaddy',
        url: godaddyUrl,
        typical: typicalLabel(row.gd),
        renewal: typicalLabel(row.renewGD),
        freebies: ['Fast DNS', 'Support'],
      },
    ];
  };

  // Tailwind-safe width classes for progress (0%..100% in 5% steps)
  const WIDTH_CLASSES = [
    'w-[0%]','w-[5%]','w-[10%]','w-[15%]','w-[20%]','w-[25%]','w-[30%]','w-[35%]','w-[40%]','w-[45%]',
    'w-[50%]','w-[55%]','w-[60%]','w-[65%]','w-[70%]','w-[75%]','w-[80%]','w-[85%]','w-[90%]','w-[95%]','w-[100%]'
  ] as const;
  const progressWidthClass = (pct?: number) => {
    const n = Math.max(0, Math.min(100, Math.round((pct || 0) / 5) * 5));
    const idx = Math.round(n / 5);
    return WIDTH_CLASSES[idx];
  };

  const fetchUserReports = async (domain: string, trustScore: number) => {
    // Simulate fetching user reports from various sources
    // In production, this would integrate with APIs like:
    // - Scamadviser, Trustpilot, Web of Trust (WOT)
    // - Better Business Bureau, Google Safe Browsing
    
    // Simulate based on trust score
    const totalReports = Math.floor(Math.random() * 500) + 50;
    const positivePercentage = trustScore >= 70 ? 0.7 + Math.random() * 0.25 : 
                               trustScore >= 50 ? 0.4 + Math.random() * 0.3 :
                               0.1 + Math.random() * 0.3;
    
    const positiveReports = Math.floor(totalReports * positivePercentage);
    const negativeReports = totalReports - positiveReports;
    
    const commonComplaints: string[] = [];
    
    if (trustScore < 40) {
      commonComplaints.push("Suspicious payment requests");
      commonComplaints.push("Poor customer service");
      commonComplaints.push("Misleading product descriptions");
      commonComplaints.push("Difficulty getting refunds");
    } else if (trustScore < 60) {
      commonComplaints.push("Slow delivery times");
      commonComplaints.push("Occasional quality issues");
      commonComplaints.push("Limited customer support");
    } else if (trustScore < 80) {
      commonComplaints.push("Minor shipping delays reported");
      commonComplaints.push("Some users report communication issues");
    } else {
      commonComplaints.push("Few complaints reported");
      commonComplaints.push("Generally positive feedback");
    }
    
    return {
      totalReports,
      positiveReports,
      negativeReports,
      commonComplaints,
      trustRating: positivePercentage * 5 // Convert to 5-star rating
    };
  };

  const fetchExternalReports = async (domain: string) => {
    // Fetch reports from various internet sources
    const reports = [];
    
    // ScamAdviser
    reports.push({
      source: 'ScamAdviser',
      name: 'ScamAdviser Trust Report',
      url: `https://www.scamadviser.com/check-website/${domain}`,
      description: 'Comprehensive trust score and safety analysis',
      icon: '🛡️'
    });
    
    // Trustpilot
    reports.push({
      source: 'Trustpilot',
      name: 'Trustpilot Reviews',
      url: `https://www.trustpilot.com/review/${domain}`,
      description: 'Customer reviews and ratings',
      icon: '⭐'
    });
    
    // URLVoid
    reports.push({
      source: 'URLVoid',
      name: 'URLVoid Security Scan',
      url: `https://www.urlvoid.com/scan/${domain}`,
      description: 'Multiple blacklist and security checks',
      icon: '🔍'
    });
    
    return reports;
  };

  const generateAITrustAnalysis = async (
    domain: string,
    trustScore: number,
    phishingInfo?: { isPhishing: boolean; confidence: number; patterns: string[]; likelyTarget?: string },
    sslStatus?: string,
    domainAge?: string
  ) => {
    try {
      // Check if Puter AI is available
      if (typeof window !== 'undefined' && window.puter?.ai) {
        const prompt = `As a cybersecurity expert, analyze this domain for trustworthiness and phishing indicators: ${domain}

Context:
- Trust Score: ${trustScore}/100
- SSL Status: ${sslStatus || 'Unknown'}
- Domain Age: ${domainAge || 'Unknown'}
${phishingInfo?.isPhishing ? `- ⚠️ PHISHING DETECTED (${phishingInfo.confidence}% confidence)
- Suspicious Patterns: ${phishingInfo.patterns.join(', ')}
- ${phishingInfo.likelyTarget ? `Likely impersonating: ${phishingInfo.likelyTarget}` : ''}` : ''}

Please provide:
1. 4-5 specific AI-powered insights about this domain's security and trustworthiness
2. Domain characteristics analysis (length, structure, TLD, special characters, etc.)
3. Analysis notes (do NOT provide a recommendation - that will be generated separately)

Format as JSON:
{
  "aiInsights": ["insight1", "insight2", "insight3", "insight4"],
  "domainCharacteristics": [
    {"label": "Domain Length", "status": "Normal/Suspicious/Safe", "analysis": "brief explanation"},
    {"label": "TLD Analysis", "status": "Trusted/Common/Suspicious", "analysis": "brief explanation"},
    {"label": "Character Pattern", "status": "Clean/Contains Hyphens/Suspicious", "analysis": "brief explanation"},
    {"label": "Brand Similarity", "status": "No Match/Similar/Exact Match", "analysis": "brief explanation"}
  ]
}`;

        const response = await window.puter.ai.chat(prompt);
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);
        
        try {
          const parsed = JSON.parse(responseText);
          
          // Determine risk color based on risk level
          const riskColorMap: { [key: string]: string } = {
            'Low': 'text-green-600',
            'Medium': 'text-yellow-600',
            'High': 'text-orange-600',
            'Critical': 'text-red-600'
          };
          
          // ALWAYS use the calculated trust score, not AI's suggestion
          const finalTrustLikelihood = trustScore;
          
          // Calculate risk level based on trust score (inverse relationship)
          let calculatedRiskLevel = 'Medium';
          if (finalTrustLikelihood >= 80) {
            calculatedRiskLevel = 'Low';
          } else if (finalTrustLikelihood >= 60) {
            calculatedRiskLevel = 'Medium';
          } else if (finalTrustLikelihood >= 40) {
            calculatedRiskLevel = 'High';
          } else {
            calculatedRiskLevel = 'Critical';
          }
          
          // Generate appropriate recommendation based on trust score
          let recommendation = '';
          if (phishingInfo?.isPhishing && (phishingInfo.confidence ?? 0) >= 60) {
            recommendation = [
              'Critical risk: Do NOT proceed.',
              'Close the site immediately and avoid clicking any links.',
              'Do not enter passwords or payment details.',
              'If you interacted already, change affected passwords and contact your bank.'
            ].join(' \n• ');
            recommendation = '• ' + recommendation;
          } else if (finalTrustLikelihood >= 80) {
            recommendation = [
              'Looks trustworthy: you can proceed.',
              'Still verify the URL spelling and padlock (HTTPS).',
              'Use strong, unique passwords and enable 2FA when possible.'
            ].join(' \n• ');
            recommendation = '• ' + recommendation;
          } else if (finalTrustLikelihood >= 60) {
            recommendation = [
              'Likely safe: proceed with caution.',
              'Avoid sharing sensitive data unless necessary.',
              'Prefer guest checkout or a trusted payment provider.'
            ].join(' \n• ');
            recommendation = '• ' + recommendation;
          } else if (finalTrustLikelihood >= 40) {
            recommendation = [
              'Use high caution: limited trust signals.',
              'Do not enter personal or payment information.',
              'Search for independent reviews before using this site.'
            ].join(' \n• ');
            recommendation = '• ' + recommendation;
          } else {
            recommendation = [
              'High risk: avoid this site.',
              'Do not download files or submit any forms.',
              'Consider reporting this website if it looks fraudulent.'
            ].join(' \n• ');
            recommendation = '• ' + recommendation;
          }
          
          return {
            trustLikelihood: finalTrustLikelihood,
            riskLevel: calculatedRiskLevel,
            riskColor: riskColorMap[calculatedRiskLevel],
            aiInsights: parsed.aiInsights || [],
            domainCharacteristics: (parsed.domainCharacteristics || []).map((char: any) => ({
              label: char.label,
              status: char.status,
              statusColor: char.status.toLowerCase().includes('safe') || char.status.toLowerCase().includes('trusted') || char.status.toLowerCase().includes('clean') || char.status.toLowerCase().includes('normal')
                ? 'text-green-600 bg-green-50'
                : char.status.toLowerCase().includes('suspicious') 
                ? 'text-red-600 bg-red-50'
                : 'text-yellow-600 bg-yellow-50'
            })),
            recommendation: recommendation || parsed.recommendation || 'Exercise caution when visiting this website.'
          };
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
        }
      }
    } catch (error) {
      console.error("AI Trust Analysis error:", error);
    }

    // Fallback analysis based on basic metrics
  const trustLikelihood = trustScore;
  let riskLevel = 'Medium';
  let riskColor = 'text-yellow-600';
    
    if (trustScore >= 80) {
      riskLevel = 'Low';
      riskColor = 'text-green-600';
    } else if (trustScore >= 60) {
      riskLevel = 'Medium';
      riskColor = 'text-yellow-600';
    } else if (trustScore >= 40) {
      riskLevel = 'High';
      riskColor = 'text-orange-600';
    } else {
      riskLevel = 'Critical';
      riskColor = 'text-red-600';
    }

  const aiInsights: string[] = [];
    const domainLength = domain.length;
    
    if (phishingInfo?.isPhishing) {
      aiInsights.push(`⚠️ Domain shows ${phishingInfo.confidence}% likelihood of being a phishing attempt`);
      if (phishingInfo.likelyTarget) {
        aiInsights.push(`Appears to impersonate ${phishingInfo.likelyTarget} brand`);
      }
    }
    
    if (domainLength > 30) {
      aiInsights.push('Domain name is unusually long, which is common in phishing attempts');
    } else if (domainLength < 10) {
      aiInsights.push('Short domain name, which is generally associated with established websites');
    }
    
    if (domain.includes('-')) {
      aiInsights.push('Domain contains hyphens, which can be used to mimic legitimate brands');
    }
    
    if (sslStatus?.includes('detected')) {
      aiInsights.push('SSL certificate present, indicating encrypted connections');
    } else {
      aiInsights.push('⚠️ No SSL certificate detected - data transmission is not encrypted');
    }

    const domainCharacteristics = [
      {
        label: 'Domain Length',
        status: domainLength > 30 ? 'Too Long' : domainLength < 15 ? 'Normal' : 'Acceptable',
        statusColor: domainLength > 30 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
      },
      {
        label: 'Special Characters',
        status: domain.includes('-') || domain.includes('_') ? 'Contains Hyphens' : 'Clean',
        statusColor: domain.includes('-') || domain.includes('_') ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
      },
      {
        label: 'SSL Certificate',
        status: sslStatus?.includes('detected') ? 'Present' : 'Missing',
        statusColor: sslStatus?.includes('detected') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      }
    ];

    // Tailored recommendation by score and phishing signal
    let recommendation = '';
    if (phishingInfo?.isPhishing && (phishingInfo.confidence ?? 0) >= 60) {
      recommendation = [
        'Critical risk: Do NOT proceed.',
        'Close the site immediately and avoid clicking any links.',
        'Do not enter passwords or payment details.',
        'If you interacted already, change affected passwords and contact your bank.'
      ].join(' \n• ');
      recommendation = '• ' + recommendation; // bullet formatting
    } else if (trustScore >= 80) {
      recommendation = [
        'Looks trustworthy: you can proceed.',
        'Still verify the URL spelling and padlock (HTTPS).',
        'Use strong, unique passwords and enable 2FA when possible.'
      ].join(' \n• ');
      recommendation = '• ' + recommendation;
    } else if (trustScore >= 60) {
      recommendation = [
        'Likely safe: proceed with caution.',
        'Avoid sharing sensitive data unless necessary.',
        'Prefer guest checkout or a trusted payment provider.'
      ].join(' \n• ');
      recommendation = '• ' + recommendation;
    } else if (trustScore >= 40) {
      recommendation = [
        'Use high caution: limited trust signals.',
        'Do not enter personal or payment information.',
        'Search for independent reviews before using this site.'
      ].join(' \n• ');
      recommendation = '• ' + recommendation;
    } else {
      recommendation = [
        'High risk: avoid this site.',
        'Do not download files or submit any forms.',
        'Consider reporting this website if it looks fraudulent.'
      ].join(' \n• ');
      recommendation = '• ' + recommendation;
    }

    return {
      trustLikelihood,
      riskLevel,
      riskColor,
      aiInsights,
      domainCharacteristics,
      recommendation
    };
  };

  const generateTrustHighlights = (
    trustScore: number,
    hasSSL: boolean,
    domainAge: number | null,
    scamKeywords: string[],
    phishingInfo?: { isPhishing: boolean; confidence: number; patterns: string[]; likelyTarget?: string }
  ) => {
    const positiveHighlights: string[] = [];
    const negativeHighlights: string[] = [];

    // Positive highlights
    if (hasSSL) {
      positiveHighlights.push("We found a valid SSL certificate");
    }

    if (domainAge !== null) {
      if (domainAge >= 5) {
        positiveHighlights.push(`This website has been active for ${domainAge} years, indicating established presence`);
      } else if (domainAge >= 2) {
        positiveHighlights.push(`Domain has been registered for ${domainAge} years`);
      }
    }

    if (scamKeywords.length === 0) {
      positiveHighlights.push("No obvious scam-related keywords were detected in the domain name");
    }

    if (!phishingInfo?.isPhishing) {
      positiveHighlights.push("Our phishing detection system did not identify this as a phishing attempt");
    }

    if (trustScore >= 80) {
      positiveHighlights.push("The website shows multiple positive trust signals");
    }

    // Negative highlights
    if (!hasSSL) {
      negativeHighlights.push("The website does not have a valid SSL certificate, which is concerning for security");
    }

    if (domainAge !== null) {
      if (domainAge < 0.5) {
        negativeHighlights.push("The age of this site is very young (less than 6 months old)");
      } else if (domainAge < 1) {
        negativeHighlights.push("This is a relatively new domain (less than 1 year old), which requires extra caution");
      }
    }

    if (scamKeywords.length > 0) {
      negativeHighlights.push(`The domain contains ${scamKeywords.length} suspicious keyword${scamKeywords.length > 1 ? 's' : ''} commonly associated with scams`);
    }

    if (phishingInfo?.isPhishing) {
      negativeHighlights.push(`Our AI detected this as a potential phishing site with ${phishingInfo.confidence}% confidence`);
      if (phishingInfo.likelyTarget) {
        negativeHighlights.push(`This site may be impersonating ${phishingInfo.likelyTarget}`);
      }
    }

    if (trustScore < 40) {
      negativeHighlights.push("The overall trust score is critically low, indicating high risk");
    } else if (trustScore < 60) {
      negativeHighlights.push("The trust score suggests limited positive signals about this website");
    }

    // Ensure we have at least some highlights
    if (positiveHighlights.length === 0) {
      positiveHighlights.push("Limited positive information available about this website");
    }

    if (negativeHighlights.length === 0 && trustScore >= 70) {
      negativeHighlights.push("No major red flags detected during our analysis");
    }

    return {
      positive: positiveHighlights,
      negative: negativeHighlights
    };
  };

  const fetchDomainDetails = async (domain: string, domainAge: number) => {
    try {
      // Method 1: Try using RDAP (Registration Data Access Protocol)
      const rdapResponse = await fetch(`https://rdap.org/domain/${domain}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (rdapResponse.ok) {
        const rdapData = await rdapResponse.json();
        console.log('RDAP Data:', rdapData);
        
        // Extract registration date
        let registrationDate = "Information not available";
        if (rdapData.events && Array.isArray(rdapData.events)) {
          const registrationEvent = rdapData.events.find((event: any) => 
            event.eventAction === 'registration' || event.eventAction === 'last update of RDAP database'
          );
          if (registrationEvent && registrationEvent.eventDate) {
            const date = new Date(registrationEvent.eventDate);
            if (!isNaN(date.getTime())) {
              registrationDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            }
          }
        }

        // Extract contact information from entities
        let contactEmail = null;
        let contactPhone = null;
        let registrar = null;
        let registrantContact = null;
        let nameservers: string[] = [];
        
        if (rdapData.entities && Array.isArray(rdapData.entities)) {
          for (const entity of rdapData.entities) {
            // Extract registrar
            if (entity.roles && entity.roles.includes('registrar') && entity.vcardArray) {
              const fnField = entity.vcardArray[1]?.find((f: any) => f[0] === 'fn');
              if (fnField && fnField[3]) {
                registrar = fnField[3];
              }
            }
            
            // Extract registrant contact
            if (entity.roles && entity.roles.includes('registrant') && entity.vcardArray) {
              const fnField = entity.vcardArray[1]?.find((f: any) => f[0] === 'fn');
              if (fnField && fnField[3]) {
                registrantContact = fnField[3];
              }
            }
            
            // Check vcardArray for contact info
            if (entity.vcardArray && Array.isArray(entity.vcardArray) && entity.vcardArray[1]) {
              for (const field of entity.vcardArray[1]) {
                if (Array.isArray(field)) {
                  if (field[0] === 'email' && !contactEmail && field[3]) {
                    contactEmail = field[3];
                  }
                  if (field[0] === 'tel' && !contactPhone && field[3]) {
                    contactPhone = field[3];
                  }
                }
              }
            }
          }
        }

        // Extract nameservers
        if (rdapData.nameservers && Array.isArray(rdapData.nameservers)) {
          nameservers = rdapData.nameservers
            .map((ns: any) => ns.ldhName || ns.unicodeName)
            .filter((name: any) => name);
        }

        console.log('Extracted data:', { registrationDate, contactEmail, contactPhone, registrar, registrantContact, nameservers });

        return {
          registrationDate,
          contactEmail,
          contactPhone,
          registrar,
          registrantContact,
          nameservers
        };
      }
    } catch (error) {
      console.error("RDAP API error:", error);
    }

    try {
      // Method 2: Try using who.is API (free, no key required)
      const whoisResponse = await fetch(`https://www.who.is/whois/${domain}`, {
        headers: {
          'Accept': 'text/html'
        }
      });
      
      if (whoisResponse.ok) {
        const htmlText = await whoisResponse.text();
        
        // Parse HTML for registration date
        let registrationDate = "Information not available";
        const creationDateMatch = htmlText.match(/Creation Date:\s*([^\n<]+)/i) || 
                                 htmlText.match(/Registered On:\s*([^\n<]+)/i) ||
                                 htmlText.match(/Created:\s*([^\n<]+)/i);
        
        if (creationDateMatch && creationDateMatch[1]) {
          const dateStr = creationDateMatch[1].trim();
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            registrationDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        }

        // Parse for contact email
        const emailMatch = htmlText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const contactEmail = emailMatch ? emailMatch[1] : null;
        
        // Parse for phone
        const phoneMatch = htmlText.match(/Phone:\s*([+\d\s()-]+)/i);
        const contactPhone = phoneMatch ? phoneMatch[1].trim() : null;

        // Parse for registrar
        const registrarMatch = htmlText.match(/Registrar:\s*([^\n<]+)/i) ||
                              htmlText.match(/Sponsoring Registrar:\s*([^\n<]+)/i);
        const registrar = registrarMatch ? registrarMatch[1].trim() : null;

        // Parse for registrant contact
        const registrantMatch = htmlText.match(/Registrant(?:\s+Name)?:\s*([^\n<]+)/i) ||
                               htmlText.match(/Registrant Organization:\s*([^\n<]+)/i);
        const registrantContact = registrantMatch ? registrantMatch[1].trim() : null;

        // Parse for nameservers
        const nameservers: string[] = [];
        const nsMatches = htmlText.matchAll(/(?:Name Server|Nameserver|DNS):\s*([^\n<]+)/gi);
        for (const match of nsMatches) {
          const ns = match[1].trim().toLowerCase();
          if (ns && !nameservers.includes(ns)) {
            nameservers.push(ns);
          }
        }

        return {
          registrationDate,
          contactEmail,
          contactPhone,
          registrar,
          registrantContact,
          nameservers
        };
      }
    } catch (error) {
      console.error("Who.is API error:", error);
    }

    try {
      // Method 3: Try ipwhois.io API (free tier available)
      const ipwhoisResponse = await fetch(`https://ipwhois.app/json/${domain}?objects=registrar,events`);
      
      if (ipwhoisResponse.ok) {
        const ipwhoisData = await ipwhoisResponse.json();
        console.log('IPWhois Data:', ipwhoisData);
        
        let registrationDate = "Information not available";
        if (ipwhoisData.created) {
          const date = new Date(ipwhoisData.created);
          if (!isNaN(date.getTime())) {
            registrationDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        }

        return {
          registrationDate,
          contactEmail: ipwhoisData.registrar_email || ipwhoisData.abuse_email || null,
          contactPhone: ipwhoisData.registrar_phone || ipwhoisData.abuse_phone || null,
          registrar: ipwhoisData.registrar || ipwhoisData.org || ipwhoisData.asn_org || null,
          registrantContact: ipwhoisData.registrant || ipwhoisData.registrant_name || ipwhoisData.registrant_organization || ipwhoisData.org || null,
          nameservers: ipwhoisData.nameservers || []
        };
      }
    } catch (error) {
      console.error("IPWhois API error:", error);
    }

    // Final fallback: Return unavailable
    console.warn("All WHOIS APIs failed for domain:", domain);
    return {
      registrationDate: "Information not available",
      contactEmail: null,
      contactPhone: null,
      registrar: null,
      registrantContact: null,
      nameservers: []
    };
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType) {
      alert("Please select a report type");
      return;
    }

    setReportSubmitting(true);

    try {
      // Simulate report submission (you can replace this with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(`Thank you for your report! We'll review the ${reportType} report for ${result?.domainName}.`);
      
      // Reset form and close modal
      setReportType("");
      setReportDetails("");
      setShowReportModal(false);
    } catch (error) {
      alert("Failed to submit report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const analyzeWebsite = async () => {
    if (!validateUrl(url)) return;

    setAnalyzing(true);
    setResult(null);

    try {
      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Extract domain
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname;

      // Perform basic checks
      const scamKeywords = checkForScamKeywords(domain);
      const sslCheck = analyzeSSL(normalizedUrl);
      
      // Check for phishing patterns
      const phishingDetection = detectPhishingPatterns(domain);
      
      // Fetch real domain details from WHOIS
      // Pass 0 as initial domain age, will be calculated from actual data
      const domainDetails = await fetchDomainDetails(domain, 0);
      
      // Calculate actual domain age from registration date
      let actualDomainAge: number | null = null;
      let domainAgeText = "Information not available";
      
      if (domainDetails.registrationDate !== "Information not available") {
        try {
          const regDate = new Date(domainDetails.registrationDate);
          const currentDate = new Date();
          const ageInYears = (currentDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          
          // Only set actualDomainAge if we got a valid date
          if (!isNaN(ageInYears) && ageInYears >= 0) {
            actualDomainAge = ageInYears;
            
            if (actualDomainAge < 1) {
              const ageInMonths = Math.floor(ageInYears * 12);
              domainAgeText = ageInMonths > 0 ? `~${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}` : "Less than 1 month";
            } else {
              domainAgeText = `~${Math.floor(actualDomainAge)} year${Math.floor(actualDomainAge) !== 1 ? 's' : ''}`;
            }
          }
        } catch (error) {
          console.error("Error calculating domain age:", error);
          domainAgeText = "Unable to calculate";
          actualDomainAge = null;
        }
      }
      
      // Calculate trust score with all parameters including domain name and registrar
      const trustScore = calculateTrustScore(
        actualDomainAge,
        sslCheck.hasSSL,
        scamKeywords,
        domain.length,
        phishingDetection.confidence,
        domain, // Pass the actual domain name for TLD analysis
        domainDetails.registrar // Pass registrar for reputation scoring
      );

      // Get verdict
      const verdictData = getVerdict(trustScore);

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate AI analysis with phishing context
      setLoading(true);
      const aiAnalysis = await generateAIAnalysis(
        normalizedUrl,
        trustScore,
        scamKeywords,
        sslCheck.message,
        phishingDetection
      );

      console.log("AI Analysis Result:", aiAnalysis);
      console.log("Reasons:", aiAnalysis.reasons);
      console.log("Safety Tips:", aiAnalysis.safetyTips);

      // Fetch user reports
      const userReports = await fetchUserReports(domain, trustScore);

      // Fetch external reports
      const externalReports = await fetchExternalReports(domain);

      // Generate AI Trust Analysis
      const aiTrustAnalysis = await generateAITrustAnalysis(
        domain,
        trustScore,
        phishingDetection.isPhishing ? phishingDetection : undefined,
        sslCheck.message,
        domainAgeText
      );

      // Generate Trust Highlights
      const trustHighlights = generateTrustHighlights(
        trustScore,
        sslCheck.hasSSL,
        actualDomainAge,
        scamKeywords,
        phishingDetection.isPhishing ? phishingDetection : undefined
      );

      const analysis: WebsiteAnalysis = {
        trustScore,
        verdict: verdictData.verdict,
        verdictColor: verdictData.color,
        verdictBgColor: verdictData.bgColor,
        reasons: aiAnalysis.reasons,
        safetyTips: aiAnalysis.safetyTips,
        domainAge: domainAgeText,
        sslStatus: sslCheck.message,
        registrar: domainDetails.registrar || "Information not available",
        domainName: domain,
        protocol: sslCheck.hasSSL ? "HTTPS (Secure)" : "HTTP (Unsecured)",
        lastChecked: new Date().toLocaleString(),
        registrationDate: domainDetails.registrationDate,
        contactEmail: domainDetails.contactEmail,
        contactPhone: domainDetails.contactPhone,
        registrantContact: domainDetails.registrantContact,
        nameservers: domainDetails.nameservers || [],
        phishingDetection: phishingDetection.isPhishing ? phishingDetection : undefined,
        userReports,
        aiTrustAnalysis,
        externalReports,
        trustHighlights
      };

      setResult(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      setErrors({ url: "Failed to analyze website. Please check the URL and try again." });
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const resetChecker = () => {
    setUrl("");
    setResult(null);
    setErrors({});
    setLanguage("en");
  };

  const handleInputChange = (value: string) => {
    setUrl(value);
    if (errors.url) {
      setErrors({ ...errors, url: undefined });
    }
  };

  const translations = {
    en: {
      title: "Website Legitimacy Checker",
      subtitle: "AI-Powered Security Analysis",
      description: "Check if a website is safe and trustworthy before you visit or share personal information",
      inputLabel: "Website URL",
      inputPlaceholder: "Enter website URL (e.g., example.com)",
      analyzeButton: "Analyze Website",
      analyzing: "Analyzing...",
      resetButton: "Check Another",
      trustScore: "Trust Score",
      verdict: "Verdict",
      keyFindings: "Key Findings",
      safetyRecommendations: "Safety Recommendations",
      technicalDetails: "Technical Details",
      domainAge: "Domain Age",
      sslStatus: "SSL Status",
      registrar: "Analysis Status",
      domainName: "Domain Name",
      protocol: "Protocol",
      lastChecked: "Last Checked",
      registrationDate: "Registration Date",
      contactEmail: "Contact Email",
      contactPhone: "Contact Phone",
      userReports: "User Reports & Reviews",
      totalReports: "Total Reports",
      positiveReports: "Positive Reports",
      negativeReports: "Negative Reports",
      trustRating: "User Trust Rating",
      externalReports: "External Reports & Analysis",
      externalReportsDesc: "Check this website on trusted security platforms",
      viewReport: "View Report",
      commonComplaints: "Common User Complaints",
      noComplaints: "No major complaints reported",
      notAvailable: "Not Available",
      privacyProtected: "Protected by Privacy Service",
      noDataAvailable: "No data available at this time",
      phishingWarning: "⚠️ PHISHING ALERT",
      phishingDetected: "Potential Phishing Website Detected",
      phishingConfidence: "Confidence Level",
      suspiciousPatterns: "Suspicious Patterns Detected",
      likelyImpersonating: "Likely Impersonating",
      phishingDescription: "This website shows signs of being a phishing or fake website designed to steal your information. DO NOT enter any personal details, passwords, or payment information."
    },
    hi: {
      title: "वेबसाइट वैधता जांचकर्ता",
      subtitle: "AI-संचालित सुरक्षा विश्लेषण",
      description: "किसी वेबसाइट पर जाने या व्यक्तिगत जानकारी साझा करने से पहले जांचें कि यह सुरक्षित है या नहीं",
      inputLabel: "वेबसाइट URL",
      inputPlaceholder: "वेबसाइट URL दर्ज करें (उदा., example.com)",
      analyzeButton: "वेबसाइट का विश्लेषण करें",
      analyzing: "विश्लेषण हो रहा है...",
      resetButton: "दूसरी जांचें",
      trustScore: "विश्वास स्कोर",
      verdict: "फैसला",
      keyFindings: "मुख्य निष्कर्ष",
      safetyRecommendations: "सुरक्षा सिफारिशें",
      technicalDetails: "तकनीकी विवरण",
      domainAge: "डोमेन आयु",
      sslStatus: "SSL स्थिति",
      registrar: "विश्लेषण स्थिति",
      domainName: "डोमेन नाम",
      protocol: "प्रोटोकॉल",
      lastChecked: "अंतिम जाँच",
      registrationDate: "पंजीकरण तिथि",
      contactEmail: "संपर्क ईमेल",
      contactPhone: "संपर्क फ़ोन",
      userReports: "उपयोगकर्ता रिपोर्ट और समीक्षाएं",
      totalReports: "कुल रिपोर्ट",
      positiveReports: "सकारात्मक रिपोर्ट",
      negativeReports: "नकारात्मक रिपोर्ट",
      trustRating: "उपयोगकर्ता विश्वास रेटिंग",
      externalReports: "बाहरी रिपोर्ट और विश्लेषण",
      externalReportsDesc: "विश्वसनीय सुरक्षा प्लेटफार्मों पर इस वेबसाइट की जाँच करें",
      viewReport: "रिपोर्ट देखें",
      commonComplaints: "सामान्य उपयोगकर्ता शिकायतें",
      noComplaints: "कोई बड़ी शिकायत नहीं",
      notAvailable: "उपलब्ध नहीं है",
      privacyProtected: "गोपनीयता सेवा द्वारा सुरक्षित",
      noDataAvailable: "इस समय कोई डेटा उपलब्ध नहीं है",
      phishingWarning: "⚠️ फ़िशिंग अलर्ट",
      phishingDetected: "संभावित फ़िशिंग वेबसाइट का पता चला",
      phishingConfidence: "विश्वास स्तर",
      suspiciousPatterns: "संदिग्ध पैटर्न का पता चला",
      likelyImpersonating: "संभवतः नकल कर रहा है",
      phishingDescription: "यह वेबसाइट एक फ़िशिंग या नकली वेबसाइट होने के संकेत दिखाती है जो आपकी जानकारी चुराने के लिए डिज़ाइन की गई है। किसी भी व्यक्तिगत विवरण, पासवर्ड, या भुगतान जानकारी दर्ज न करें।"
    }
  };

  const t = translations[language];

  return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <Navbar />

      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Lightning Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightning-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Lightning bolts */}
    <path className="animate-pulse" d="M 100 -50 L 150 200 L 120 200 L 180 500" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.2"/>
    <path className="animate-pulse delay-500" 
                  d="M 300 -100 L 320 150 L 290 150 L 340 400" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.15"/>
    <path className="animate-pulse delay-1000" 
                  d="M 500 50 L 520 250 L 490 250 L 540 500" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.12"/>
    <path className="animate-pulse delay-1500" 
                  d="M 700 -20 L 730 180 L 700 180 L 760 450" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.18"/>
    <path className="animate-pulse delay-2000" 
                  d="M 900 30 L 920 220 L 890 220 L 950 480" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.15"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t.title} <span className="bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">{t.subtitle}</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>
      </section>

      <section className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Section - Input Form (4 columns) */}
            <div className="no-print lg:col-span-4 bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-200 lg:sticky lg:top-24">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{t.title}</h2>
                <p className="text-slate-600 text-sm">{t.description}</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); analyzeWebsite(); }} className="space-y-2">
                <div className="w-full">
                  <label htmlFor="url" className="block text-base font-semibold text-slate-700 mb-3">
                    {t.inputLabel}
                  </label>
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className={`w-full px-6 py-5 text-lg border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 transition-all ${
                      errors.url ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.url && (
                    <p className="text-red-500 text-sm mt-2">{errors.url}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={analyzing || loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-5 px-6 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {analyzing || loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.analyzing}
                    </span>
                  ) : t.analyzeButton}
                </button>
              </form>
            </div>

            {/* Right Section - Results (8 columns - wider) */}
            <div className="lg:col-span-8">
              {analyzing || loading ? (
                <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200 flex items-center justify-center min-h-[500px]">
                  <div className="text-center">
                    {/* Animated SVG Loader */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <svg className="animate-spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="220"
                          strokeDashoffset="80"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Inner Shield Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>

                    {/* Analyzing Text */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                      {loading ? "Generating AI Analysis..." : "Analyzing Website..."}
                    </h3>
                    <p className="text-base sm:text-lg text-slate-600 mb-6">
                      {loading 
                        ? "Our AI is analyzing the domain for trust and security indicators"
                        : "Checking SSL certificates, domain age, and security patterns"
                      }
                    </p>

                    {/* Progress Steps */}
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">Domain Verification</div>
                          <div className="text-xs text-slate-500">Validating domain structure and TLD</div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 text-left transition-opacity ${loading ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          {loading ? (
                            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">AI Trust Analysis</div>
                          <div className="text-xs text-slate-500">Analyzing for phishing patterns and risks</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-left opacity-50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-600">Generating Report</div>
                          <div className="text-xs text-slate-400">Compiling security insights</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <div ref={resultRef} className="animate-fade-in" id="print-section">
                  {/* Check if domain is not registered */}
                  {result.registrationDate === "Information not available" && result.domainAge === "Information not available" ? (
                    /* Domain Not Registered - Premium Design with Pricing */
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200">
                      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border-2 border-blue-200">
                        {/* Header removed to avoid provider branding */}

                        <div className="p-5 sm:p-6 lg:p-7">
                          {/* Status Badge & Icon */}
                          <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-semibold text-green-700">Available for Registration</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                              {result.domainName}
                            </h3>
                            
                            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">
                              This domain is available! Register it now before someone else claims it.
                            </p>
                          </div>

                          {/* Enhanced Pricing Card - Price in USD, Offer, Freebies, Trust Factors */}
                          {(() => {
                            const hostinger = (pricingOffers || [])
                              .filter(o => (o.provider || '').toLowerCase() === 'hostinger')
                              .map(o => ({
                                url: o.url,
                                price: o.price,
                                offer: o.offer,
                                freebies: o.freebies || ['WHOIS Privacy','SSL Support','1-Click DNS']
                              }));

                            const fallbackUrl = `https://www.hostinger.com/domain-name-results?domain=${encodeURIComponent(result.domainName || '')}&REFERRALCODE=1TEAMTECH21&from=domain-name-search`;
                            const offerData = hostinger.length > 0 ? hostinger[0] : {
                              url: fallbackUrl, price: null, offer: null,
                              freebies: ['WHOIS Privacy','SSL Support','1-Click DNS']
                            };

                            return (
                              <div className="mb-6">
                                <a
                                  href={offerData.url}
                                  target="_blank"
                                  rel="noopener noreferrer sponsored"
                                  className="group block bg-white rounded-xl shadow-lg border border-cyan-300 p-6 hover:shadow-xl transition-all"
                                >
                                  {/* Price and Buy Section */}
                                  <div className="flex items-center justify-between gap-6 mb-5 pb-5 border-b border-slate-100">
                                    <div className="flex-1">
                                      {offerData.price ? (
                                        <>
                                          <div className="flex items-baseline gap-3 mb-2">
                                            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                              {offerData.price}
                                            </div>
                                            <div className="text-lg font-semibold text-slate-900">USD</div>
                                          </div>
                                          <div className="text-sm text-slate-600 font-medium">First year registration</div>
                                        </>
                                      ) : (
                                        <div className="text-2xl font-bold text-slate-700 mb-2">Live pricing available</div>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-bold text-base group-hover:from-blue-500 group-hover:to-cyan-500 transition-all shadow-lg">
                                        Buy Now
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Freebies Section - Compact */}
                                  {offerData.freebies && offerData.freebies.length > 0 && (
                                    <div className="mb-4 pb-4 border-b border-slate-100">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-slate-600">Includes:</span>
                                        {offerData.freebies.map((f) => (
                                          <span key={f} className="text-xs px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                                            {f}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Trust Factors */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-slate-700">Secure</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-slate-700">Refund</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-slate-700">Trusted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-slate-700">Instant</span>
                                    </div>
                                  </div>
                                </a>
                                <p className="mt-3 text-center text-xs text-slate-500">Price is fetched live and may vary by region. USD pricing shown.</p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Domain is Registered - Show Full Analysis */
                    <>
                  {/* Print-Only Header */}
                  <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Website Security Analysis Report</h1>
                    <p className="text-sm text-slate-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-slate-600">Domain: {result.domainName}</p>
                  </div>

                  {/* Single Card with All Results */}
                  <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 border border-slate-200">
                    {/* Header with Action Buttons */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.verdict}</h2>
                      
                      <div className="no-print flex items-center gap-2">
                        {/* Report Button */}
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="hidden sm:inline">Report</span>
                        </button>

                        {/* Print PDF Button */}
                        <button
                          onClick={() => window.print()}
                          className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span className="hidden sm:inline">Print Report</span>
                          <span className="sm:hidden">Print</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center mb-6 sm:mb-8">
                      {/* Circular Trust Score Gauge - ScamAdviser Style */}
                      <div className="inline-block relative mb-4">
                        <svg 
                          className="w-64 h-40 sm:w-80 sm:h-48 md:w-96 md:h-56 mx-auto" 
                          viewBox="0 0 300 200"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={
                                result.trustScore >= 80 ? '#10b981' : 
                                result.trustScore >= 60 ? '#f59e0b' : 
                                result.trustScore >= 40 ? '#f97316' : '#dc2626'
                              } />
                              <stop offset="100%" stopColor={
                                result.trustScore >= 80 ? '#059669' : 
                                result.trustScore >= 60 ? '#d97706' : 
                                result.trustScore >= 40 ? '#ea580c' : '#b91c1c'
                              } />
                            </linearGradient>
                          </defs>
                          
                          {/* Background Arc (Light Gray) - Full semi-circle */}
                          <path
                            d="M 50 170 A 100 100 0 0 1 250 170"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="32"
                            strokeLinecap="round"
                          />
                          
                          {/* Colored Progress Arc */}
                          <path
                            d="M 50 170 A 100 100 0 0 1 250 170"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="32"
                            strokeLinecap="round"
                            strokeDasharray={`${(result.trustScore / 100) * 314.16} 314.16`}
                            className="transition-all duration-1000 ease-out"
                            style={{
                              animation: 'drawArc 1.5s ease-out forwards'
                            }}
                          />
                          
                          {/* "Trustscore" Label */}
                          <text
                            x="150"
                            y="105"
                            textAnchor="middle"
                            className="fill-slate-800"
                            style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '0.5px' }}
                          >
                            
                          </text>
                          
                          {/* Trust Score Number */}
                          <text
                            x="150"
                            y="160"
                            textAnchor="middle"
                            className={`font-bold ${
                              result.trustScore >= 80 ? 'fill-emerald-500' : 
                              result.trustScore >= 60 ? 'fill-yellow-500' : 
                              result.trustScore >= 40 ? 'fill-orange-500' : 'fill-red-500'
                            }`}
                            style={{ fontSize: '72px', fontWeight: '700' }}
                          >
                            {result.trustScore}
                          </text>
                          
                          {/* "/ 100" Text */}
                          <text
                            x="150"
                            y="188"
                            textAnchor="middle"
                            className="fill-slate-400"
                            style={{ fontSize: '24px', fontWeight: '500' }}
                          >
                            / 100
                          </text>
                        </svg>
                        
                      </div>
                      
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{result.verdict}</p>
                    </div>
                    
                    <style>{`
                      @keyframes drawArc {
                        from {
                          stroke-dasharray: 0 219.91;
                        }
                      }
                    `}</style>

                    {/* Phishing Warning - Critical Alert */}
                    {result.phishingDetection && (
                      <div className="mb-6 animate-pulse-slow">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-red-600">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center animate-bounce">
                              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{t.phishingWarning}</h3>
                              <p className="text-base sm:text-lg font-semibold text-red-50 mb-1">{t.phishingDetected}</p>
                              <p className="text-sm sm:text-base text-red-50">{t.phishingDescription}</p>
                            </div>
                          </div>

                          {/* Confidence and Target */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                              <div className="text-xs sm:text-sm text-red-50 mb-1">{t.phishingConfidence}</div>
                              <div className="text-2xl sm:text-3xl font-bold text-white">
                                {result.phishingDetection.confidence}%
                              </div>
                            </div>
                            {result.phishingDetection.likelyTarget && (
                              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                <div className="text-xs sm:text-sm text-red-50 mb-1">{t.likelyImpersonating}</div>
                                <div className="text-lg sm:text-xl font-bold text-white break-words">
                                  {result.phishingDetection.likelyTarget}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Suspicious Patterns */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                            <h4 className="text-sm sm:text-base font-bold text-white mb-2">{t.suspiciousPatterns}:</h4>
                            <ul className="space-y-2">
                              {result.phishingDetection.patterns.map((pattern, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-200 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs sm:text-sm text-white font-medium">{pattern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Trust Analysis Section */}
                    {result.aiTrustAnalysis && (
                      <div className="mb-6 sm:mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-3 sm:p-5 border-2 border-blue-200 shadow-xl">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900">AI Trust Analysis</h3>
                              <p className="text-[10px] sm:text-xs text-slate-600">Advanced AI-powered domain trustworthiness assessment</p>
                            </div>
                          </div>

                          {/* Trust Likelihood & Risk Level */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-md border border-blue-100">
                              <div className="text-[10px] sm:text-xs text-slate-600 mb-1.5 sm:mb-2 font-medium">AI Trust Likelihood</div>
                              <div className="flex items-end gap-1.5 sm:gap-2">
                                <span className="text-2xl sm:text-3xl font-bold text-cyan-700">{result.aiTrustAnalysis.trustLikelihood}</span>
                                <span className="text-sm sm:text-base text-slate-500 mb-0.5 sm:mb-1">/100</span>
                              </div>
                              <div className="mt-1.5 sm:mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-cyan-600 h-1.5 sm:h-2 rounded-full transition-all"
                                  style={{ width: `${result.aiTrustAnalysis.trustLikelihood}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-md border border-blue-100">
                              <div className="text-[10px] sm:text-xs text-slate-600 mb-1.5 sm:mb-2 font-medium">Risk Level</div>
                              <div className={`text-xl sm:text-2xl font-bold ${result.aiTrustAnalysis.riskColor}`}>
                                {result.aiTrustAnalysis.riskLevel}
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                                {['Critical', 'High', 'Medium'].includes(result.aiTrustAnalysis.riskLevel) && (
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {result.aiTrustAnalysis.riskLevel === 'Low' && (
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="text-[10px] sm:text-xs text-slate-500">AI Assessment</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Insights */}
                          {result.aiTrustAnalysis.aiInsights && result.aiTrustAnalysis.aiInsights.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI-Powered Insights
                              </h4>
                              <div className="space-y-1.5 sm:space-y-2">
                                {result.aiTrustAnalysis.aiInsights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-white rounded-lg border border-blue-100">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-700 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] sm:text-xs text-slate-700">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Domain Characteristics */}
                          {result.aiTrustAnalysis.domainCharacteristics && result.aiTrustAnalysis.domainCharacteristics.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Domain Characteristics
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {result.aiTrustAnalysis.domainCharacteristics.map((char, index) => (
                                  <div key={index} className="bg-white rounded-lg p-2 sm:p-2.5 border border-blue-100">
                                    <div className="text-[10px] sm:text-xs text-slate-600 mb-1">{char.label}</div>
                                    <div className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded inline-block ${char.statusColor}`}>
                                      {char.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Recommendation */}
                          <div className={`rounded-xl p-3 sm:p-4 shadow-lg border-2 ${
                            result.aiTrustAnalysis.riskLevel === 'Low' 
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                              : result.aiTrustAnalysis.riskLevel === 'Medium'
                              ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                              : result.aiTrustAnalysis.riskLevel === 'High'
                              ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-400'
                          }`}>
                            {/* Header with Title and Risk Badge */}
                            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                {/* Dynamic Icon based on Risk Level */}
                                {result.aiTrustAnalysis.riskLevel === 'Low' ? (
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                ) : result.aiTrustAnalysis.riskLevel === 'Medium' ? (
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                ) : result.aiTrustAnalysis.riskLevel === 'High' ? (
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <h4 className={`font-bold text-xs sm:text-sm lg:text-base min-w-0 ${
                                  result.aiTrustAnalysis.riskLevel === 'Low' 
                                    ? 'text-green-800'
                                    : result.aiTrustAnalysis.riskLevel === 'Medium'
                                    ? 'text-yellow-800'
                                    : result.aiTrustAnalysis.riskLevel === 'High'
                                    ? 'text-orange-800'
                                    : 'text-red-800'
                                }`}>AI Security Recommendation</h4>
                              </div>
                              
                              {/* Risk Badge - Always on the right */}
                              <span className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                                result.aiTrustAnalysis.riskLevel === 'Low' 
                                  ? 'bg-green-200 text-green-800'
                                  : result.aiTrustAnalysis.riskLevel === 'Medium'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : result.aiTrustAnalysis.riskLevel === 'High'
                                  ? 'bg-orange-200 text-orange-800'
                                  : 'bg-red-200 text-red-800'
                              }`}>
                                {result.aiTrustAnalysis.riskLevel} Risk
                              </span>
                            </div>

                            {/* Recommendation Text */}
                            <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words pl-7 sm:pl-9 ${
                              result.aiTrustAnalysis.riskLevel === 'Low' 
                                ? 'text-green-900'
                                : result.aiTrustAnalysis.riskLevel === 'Medium'
                                ? 'text-yellow-900'
                                : result.aiTrustAnalysis.riskLevel === 'High'
                                ? 'text-orange-900'
                                : 'text-red-900'
                            }`}>
                              {result.aiTrustAnalysis.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    

                    {/* Technical Details - Professional & Sleek - 3 Per Row */}
                    <div className="mb-6 sm:mb-8" id="technical-details">
                      {/* Section Header with Gradient Line */}
                      <div className="relative mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-40"></div>
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                              {t.technicalDetails}
                            </h3>
                            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mt-1 sm:mt-2"></div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Data Grid - Organized by Sections */}
                      <div className="space-y-6 sm:space-y-8">
                        {/* Domain Information Section */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 sm:mb-3">
                            Domain Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Domain Name */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 100-18 9 9 0 000 18z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.domainName}</p>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 break-all leading-tight">{result.domainName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Protocol */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.protocol}</p>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{result.protocol}</p>
                            </div>
                          </div>
                        </div>

                        {/* Domain Age */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.domainAge}</p>
                              {result.domainAge && result.domainAge !== "Information not available" ? (
                                <p className="text-sm font-bold text-slate-900 leading-tight">{result.domainAge}</p>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs font-semibold text-red-500">Unable to fetch</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                          </div>
                        </div>

                        {/* Registration Information Section */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 sm:mb-3">
                            Registration Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* SSL Status */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.sslStatus}</p>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{result.sslStatus}</p>
                            </div>
                          </div>
                        </div>

                        {/* Registration Date */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.registrationDate}</p>
                              {result.registrationDate && result.registrationDate !== "Information not available" ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{result.registrationDate}</p>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs font-semibold text-red-500">Unable to fetch</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Registrar */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Registrar</p>
                              {result.registrar && result.registrar !== "Analysis Complete" ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{result.registrar}</p>
                              ) : (
                                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">Information not available</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Organization */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Organization</p>
                              {result.registrantContact ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 break-words leading-tight">{result.registrantContact}</p>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs font-semibold text-amber-600">{t.privacyProtected}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nameservers */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Nameservers</p>
                              {result.nameservers && result.nameservers.length > 0 ? (
                                <div className="space-y-0.5 sm:space-y-1">
                                  {result.nameservers.slice(0, 3).map((ns, idx) => (
                                    <p key={idx} className="text-[10px] sm:text-xs font-medium text-slate-700 break-all leading-tight">{ns}</p>
                                  ))}
                                  {result.nameservers.length > 3 && (
                                    <p className="text-[10px] sm:text-xs text-slate-500">+{result.nameservers.length - 3} more</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">Information not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                          </div>
                        </div>

                        {/* Contact Information Section */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 sm:mb-3">
                            Contact Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

                        {/* Registrant Contact */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Registrant Contact</p>
                              {result.registrantContact ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 break-all leading-tight">{result.registrantContact}</p>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs font-semibold text-amber-600">Privacy Protected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Email */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.contactEmail}</p>
              {result.contactEmail ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 break-all leading-tight">{result.contactEmail}</p>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs font-semibold text-amber-600">{t.privacyProtected}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Phone */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">{t.contactPhone}</p>
                              {result.contactPhone ? (
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{result.contactPhone}</p>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs font-semibold text-amber-600">{t.privacyProtected}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Protection Info Note */}
                    {(result.registrationDate === "Information not available" || !result.contactEmail || !result.contactPhone) && (
                      <div className="mb-6 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm text-amber-900 font-semibold mb-1">
                              WHOIS Data Unavailable
                            </p>
                            <p className="text-xs sm:text-sm text-amber-800">
                              {result.registrationDate === "Information not available" ? (
                                <>Unable to fetch domain registration details from WHOIS servers. This could be due to:</>
                              ) : (
                                <>Contact details are hidden by WHOIS privacy protection services. This is common and doesn't necessarily indicate suspicious activity.</>
                              )}
                            </p>
                            {result.registrationDate === "Information not available" && (
                              <ul className="mt-2 text-xs text-amber-800 list-disc list-inside space-y-1">
                                <li>Domain privacy protection enabled</li>
                                <li>WHOIS API rate limiting or restrictions</li>
                                <li>Domain registrar's privacy policy</li>
                                <li>Recent domain registration (data not yet propagated)</li>
                                <li>Domain may not be registered yet</li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Professional Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm font-semibold text-slate-500">Analysis Results</span>
                      </div>
                    </div>

                    {/* Key Findings Section */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.keyFindings}</h3>
                      </div>

                      <ul className="space-y-2 sm:space-y-2.5 list-none">
                        {(() => {
                          console.log("Rendering reasons:", result.reasons, "Length:", result.reasons?.length);
                          return null;
                        })()}
                        {result.reasons && result.reasons.length > 0 ? (
                          result.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm sm:text-base text-slate-700 flex-1">{reason}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 sm:gap-3">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-500 flex-1 italic">Analyzing domain characteristics...</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Professional Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm font-semibold text-slate-500">Safety Guidelines</span>
                      </div>
                    </div>
                    

                    {/* Safety Recommendations Section */}
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.safetyRecommendations}</h3>
                      </div>

                      <ul className="space-y-2 sm:space-y-2.5 mb-6 ml-4">
                        {(() => {
                          console.log("Rendering safety tips:", result.safetyTips, "Length:", result.safetyTips?.length);
                          return null;
                        })()}
                        {result.safetyTips && result.safetyTips.length > 0 ? (
                          result.safetyTips.map((tip, index) => (
                            <li key={index} className="text-sm sm:text-base text-slate-700">
                              {tip}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm sm:text-base text-slate-500 italic">
                            Generating safety recommendations...
                          </li>
                        )}
                      </ul>

                      <div className="p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-xs sm:text-sm text-red-800 flex items-start gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span><strong>Disclaimer:</strong> This analysis is AI-powered and for informational purposes only. Always exercise caution and verify websites independently before sharing sensitive information.</span>
                        </p>
                      </div>
                    </div>

                    {/* External Reports Section */}
                    {result.externalReports && result.externalReports.length > 0 && (
                      <>
                        {/* Professional Divider */}
                        <div className="relative my-8">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-slate-200"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm font-semibold text-slate-500">{t.externalReports}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.externalReports}</h3>
                              <p className="text-xs sm:text-sm text-slate-600">{t.externalReportsDesc}</p>
                            </div>
                          </div>

                          {/* External Reports Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {result.externalReports.map((report, index) => (
                              <a
                                key={index}
                                href={report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-white rounded-xl shadow-md border border-slate-200 p-4 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                              >
                                {/* Hover Effect Background */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex items-start gap-3">
                                  {/* Icon */}
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {report.icon}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Source Badge */}
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {report.source}
                                      </span>
                                      <svg className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </div>
                                    
                                    {/* Report Name */}
                                    <h4 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                      {report.name}
                                    </h4>
                                    
                                    {/* Description */}
                                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                      {report.description}
                                    </p>
                                    
                                    {/* View Report Button */}
                                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                                      <span>{t.viewReport}</span>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>

                          {/* Info Box */}
                          <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <div className="text-xs sm:text-sm text-blue-800">
                                <p className="font-semibold mb-1">Cross-Reference Recommended</p>
                                <p>Check multiple sources for a comprehensive security assessment. Click on any report to view detailed analysis from that platform.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
                )}
              </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Ready to Check?</h3>
                    <p className="text-sm sm:text-base text-slate-600">Enter a website URL to analyze its safety and legitimacy</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Report Modal - Small & Centered */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Minimal */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Report Issue</h3>
                    <p className="text-xs text-white/80">Help keep web safe</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  title="Close modal"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Minimal */}
            <form onSubmit={handleReportSubmit} className="p-4">
              {/* Domain Display - Minimal */}
              <div className="mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-0.5">Reporting</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{result?.domainName}</p>
              </div>

              {/* Report Type Options - 3-column Grid */}
              <div className="mb-3">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Select Issue Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'phishing', label: 'Phishing', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    ) },
                    { value: 'malware', label: 'Malware', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) },
                    { value: 'spam', label: 'Spam', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    ) },
                    { value: 'inappropriate', label: 'Inappropriate', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) },
                    { value: 'copyright', label: 'Copyright', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    ) },
                    { value: 'other', label: 'Other', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    ) }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex flex-col items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border-2 ${
                        reportType === option.value
                          ? 'border-cyan-600 bg-cyan-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={option.value}
                        checked={reportType === option.value}
                        onChange={(e) => setReportType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                        reportType === option.value 
                          ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {option.icon}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${reportType === option.value ? 'text-cyan-900' : 'text-slate-700'}`}>
                        {option.label}
                      </span>
                      {reportType === option.value && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details - Minimal */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  Additional Details
                  <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-rose-100 focus:outline-none text-xs resize-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Helps us investigate faster</p>
              </div>

              {/* Action Buttons - Minimal */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportType}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all active:scale-95 ${
                    reportSubmitting || !reportType
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {reportSubmitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
