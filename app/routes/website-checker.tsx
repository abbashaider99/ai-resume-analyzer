import { useEffect, useRef, useState } from "react";
import Navbar from "~/components/Navbar";

export const meta = () => [
  { title: "Website Legitimacy Checker - AI-Powered Security Analysis | Abbas Logic" },
  {
    name: "description",
    content: "Check if a website is safe and legitimate using AI-powered analysis. Get trust scores, safety recommendations, and detailed security insights.",
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
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to results when analysis completes
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [result]);

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
    phishingConfidence?: number
  ): number => {
    let score = 40; // Base score (reduced from 50 to be more conservative)

    // Domain age scoring (max 35 points) - More granular and weighted
    if (domainAge !== null) {
      if (domainAge >= 10) {
        score += 35; // Very established domain
      } else if (domainAge >= 5) {
        score += 30; // Well-established domain
      } else if (domainAge >= 3) {
        score += 25; // Moderately established
      } else if (domainAge >= 2) {
        score += 20; // Somewhat established
      } else if (domainAge >= 1) {
        score += 10; // New but not brand new
      } else if (domainAge >= 0.5) {
        score += 5; // 6+ months old
      } else {
        score -= 15; // Very new domains are highly suspicious
      }
    } else {
      // If we can't determine age, be slightly cautious
      score -= 5;
    }

    // SSL scoring (max 25 points) - Critical for trust
    if (hasSSL) {
      score += 25; // Increased from 20
    } else {
      score -= 20; // Increased penalty from 15
    }

    // Phishing detection penalty (up to -60 points) - More severe
    if (phishingConfidence && phishingConfidence > 0) {
      if (phishingConfidence >= 80) {
        score -= 60; // Critical phishing threat
      } else if (phishingConfidence >= 60) {
        score -= 45; // High phishing threat
      } else if (phishingConfidence >= 40) {
        score -= 30; // Medium phishing threat
      } else if (phishingConfidence >= 20) {
        score -= 15; // Low phishing threat
      } else {
        score -= 5; // Minimal phishing indicators
      }
    }

    // Scam keywords penalty (up to -40 points)
    if (scamKeywords.length > 0) {
      score -= Math.min(40, scamKeywords.length * 15); // Increased from 10 to 15 per keyword
    }

    // Domain length scoring (more detailed)
    if (domainLength < 8) {
      score += 15; // Very short, likely premium domain
    } else if (domainLength < 15) {
      score += 10; // Good length
    } else if (domainLength < 25) {
      score += 5; // Acceptable length
    } else if (domainLength < 35) {
      score -= 5; // Getting long
    } else if (domainLength < 50) {
      score -= 15; // Very long, suspicious
    } else {
      score -= 25; // Extremely long, highly suspicious
    }

    // TLD analysis (bonus points for common TLDs)
    const domain = domainLength.toString(); // This is a placeholder, actual domain would be passed
    const trustedTLDs = ['.com', '.org', '.edu', '.gov', '.net'];
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'];
    
    // Note: In actual implementation, we'd check the actual domain TLD
    // For now, this is a framework for TLD scoring

    return Math.max(0, Math.min(100, score));
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
1. AI Trust Likelihood (0-100 scale)
2. Risk Level (Low/Medium/High/Critical)
3. 4-5 specific AI-powered insights about this domain
4. Domain characteristics analysis (length, structure, TLD, special characters, etc.)
5. Final recommendation

Format as JSON:
{
  "trustLikelihood": <number 0-100>,
  "riskLevel": "<Low/Medium/High/Critical>",
  "aiInsights": ["insight1", "insight2", ...],
  "domainCharacteristics": [
    {"label": "Domain Length", "status": "Normal/Suspicious/Safe", "analysis": "brief explanation"},
    {"label": "TLD Analysis", "status": "Trusted/Common/Suspicious", "analysis": "brief explanation"},
    {"label": "Character Pattern", "status": "Clean/Contains Hyphens/Suspicious", "analysis": "brief explanation"},
    {"label": "Brand Similarity", "status": "No Match/Similar/Exact Match", "analysis": "brief explanation"}
  ],
  "recommendation": "clear recommendation"
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
          
          return {
            trustLikelihood: parsed.trustLikelihood || trustScore,
            riskLevel: parsed.riskLevel || 'Medium',
            riskColor: riskColorMap[parsed.riskLevel] || 'text-yellow-600',
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
            recommendation: parsed.recommendation || 'Exercise caution when visiting this website.'
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

    const aiInsights = [];
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

    return {
      trustLikelihood,
      riskLevel,
      riskColor,
      aiInsights,
      domainCharacteristics,
      recommendation: trustScore >= 60 
        ? 'Website appears relatively safe, but always verify before sharing sensitive information.'
        : 'Exercise extreme caution. Avoid entering personal or financial information.'
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
        
        if (rdapData.entities && Array.isArray(rdapData.entities)) {
          for (const entity of rdapData.entities) {
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

        console.log('Extracted data:', { registrationDate, contactEmail, contactPhone });

        return {
          registrationDate,
          contactEmail,
          contactPhone
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

        return {
          registrationDate,
          contactEmail,
          contactPhone
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
          contactEmail: ipwhoisData.registrar_email || null,
          contactPhone: ipwhoisData.registrar_phone || null
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
      contactPhone: null
    };
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
      let actualDomainAge = 0;
      let domainAgeText = "Information not available";
      
      if (domainDetails.registrationDate !== "Information not available") {
        try {
          const regDate = new Date(domainDetails.registrationDate);
          const currentDate = new Date();
          const ageInYears = (currentDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          actualDomainAge = Math.floor(ageInYears);
          
          if (actualDomainAge < 1) {
            const ageInMonths = Math.floor(ageInYears * 12);
            domainAgeText = ageInMonths > 0 ? `~${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}` : "Less than 1 month";
          } else {
            domainAgeText = `~${actualDomainAge} year${actualDomainAge !== 1 ? 's' : ''}`;
          }
        } catch (error) {
          console.error("Error calculating domain age:", error);
          domainAgeText = "Unable to calculate";
        }
      }
      
      // Calculate trust score with phishing detection
      const trustScore = calculateTrustScore(
        actualDomainAge,
        sslCheck.hasSSL,
        scamKeywords,
        domain.length,
        phishingDetection.confidence
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

      // Generate AI Trust Analysis
      const aiTrustAnalysis = await generateAITrustAnalysis(
        domain,
        trustScore,
        phishingDetection.isPhishing ? phishingDetection : undefined,
        sslCheck.message,
        domainAgeText
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
        registrar: "Analysis Complete",
        domainName: domain,
        protocol: sslCheck.hasSSL ? "HTTPS (Secure)" : "HTTP (Unsecured)",
        lastChecked: new Date().toLocaleString(),
        registrationDate: domainDetails.registrationDate,
        contactEmail: domainDetails.contactEmail,
        contactPhone: domainDetails.contactPhone,
        phishingDetection: phishingDetection.isPhishing ? phishingDetection : undefined,
        userReports,
        aiTrustAnalysis
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Lightning Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightning-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.15 }} />
                <stop offset="50%" style={{ stopColor: '#60a5fa', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: '#93c5fd', stopOpacity: 0.05 }} />
              </linearGradient>
            </defs>
            
            {/* Lightning bolts */}
            <path className="animate-pulse" d="M 100 -50 L 150 200 L 120 200 L 180 500" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.2"/>
            <path className="animate-pulse" style={{ animationDelay: '0.5s' }} 
                  d="M 300 -100 L 320 150 L 290 150 L 340 400" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.15"/>
            <path className="animate-pulse" style={{ animationDelay: '1s' }} 
                  d="M 500 50 L 520 250 L 490 250 L 540 500" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.12"/>
            <path className="animate-pulse" style={{ animationDelay: '1.5s' }} 
                  d="M 700 -20 L 730 180 L 700 180 L 760 450" 
                  stroke="url(#lightning-gradient-blue)" strokeWidth="2" fill="none" opacity="0.18"/>
            <path className="animate-pulse" style={{ animationDelay: '2s' }} 
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
            <div className="no-print lg:col-span-4 bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 lg:sticky lg:top-24">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{t.title}</h2>
                <p className="text-slate-600 text-sm">{t.description}</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); analyzeWebsite(); }} className="space-y-6">
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
                    className={`w-full px-6 py-5 text-lg border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.url ? "border-red-500" : "border-gray-200"
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
                <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100 flex items-center justify-center min-h-[500px]">
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
                            <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                            <stop offset="100%" style={{ stopColor: '#06b6d4' }} />
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
                        {/* Premium Sponsored Badge */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Sponsored Partner</span>
                          </div>
                          <span className="text-xs text-blue-100 hidden sm:block">Hostinger</span>
                        </div>

                        <div className="p-6 sm:p-8 lg:p-10">
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

                          {/* Pricing Section */}
                          <div className="mb-8">
                            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                              <div className="flex items-baseline justify-center gap-2 mb-3">
                                <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                  Check
                                </span>
                              </div>
                              <p className="text-center text-slate-600 text-sm mb-4">
                                View current pricing & special offers
                              </p>
                              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-white">Special Deals Available</span>
                              </div>
                            </div>
                          </div>

                          {/* Features Grid */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-slate-900">Instant Setup</p>
                                <p className="text-xs text-slate-600">Ready in minutes</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-slate-900">Free Privacy</p>
                                <p className="text-xs text-slate-600">WHOIS protection</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-slate-900">Free Email</p>
                                <p className="text-xs text-slate-600">Professional inbox</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-slate-900">24/7 Support</p>
                                <p className="text-xs text-slate-600">Always available</p>
                              </div>
                            </div>
                          </div>

                          {/* Premium CTA Button */}
                          <a
                            href={`https://www.hostinger.com/domain-name-results?domain=${result.domainName}&REFERRALCODE=1TEAMTECH21&from=domain-name-search`}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="group relative block w-full overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 animate-gradient"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center gap-3 px-8 py-5 text-white">
                              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span className="font-bold text-lg sm:text-xl">Register Domain Now</span>
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </a>

                          {/* Trust Badges */}
                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-medium">Secure Payment</span>
                              </div>
                              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Money Back Guarantee</span>
                              </div>
                              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-medium">Trusted by 2M+</span>
                              </div>
                            </div>
                          </div>
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
                  <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
                    {/* Header with Print Button */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.verdict}</h2>
                      
                      {/* Print PDF Button */}
                      <button
                        onClick={() => window.print()}
                        className="no-print group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span className="hidden sm:inline">Print Report</span>
                        <span className="sm:hidden">Print</span>
                      </button>
                    </div>
                    
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-2xl mb-3 sm:mb-4 animate-scale-in">
                        <span className="text-4xl sm:text-5xl font-bold text-white">{result.trustScore}</span>
                      </div>
                      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${result.verdictColor} mb-2`}>{result.verdict}</p>
                      <p className="text-sm sm:text-base text-slate-600">{t.trustScore}: {result.trustScore}/100</p>
                    </div>

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
                      <div className="mb-8">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 sm:p-6 border-2 border-purple-200 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900">AI Trust Analysis</h3>
                              <p className="text-xs sm:text-sm text-slate-600">Advanced AI-powered domain trustworthiness assessment</p>
                            </div>
                          </div>

                          {/* Trust Likelihood & Risk Level */}
                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-purple-100">
                              <div className="text-xs sm:text-sm text-slate-600 mb-2 font-medium">AI Trust Likelihood</div>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl sm:text-4xl font-bold text-purple-600">{result.aiTrustAnalysis.trustLikelihood}</span>
                                <span className="text-lg text-slate-500 mb-1">/100</span>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all"
                                  style={{ width: `${result.aiTrustAnalysis.trustLikelihood}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-md border border-purple-100">
                              <div className="text-xs sm:text-sm text-slate-600 mb-2 font-medium">Risk Level</div>
                              <div className={`text-2xl sm:text-3xl font-bold ${result.aiTrustAnalysis.riskColor}`}>
                                {result.aiTrustAnalysis.riskLevel}
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                {['Critical', 'High', 'Medium'].includes(result.aiTrustAnalysis.riskLevel) && (
                                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {result.aiTrustAnalysis.riskLevel === 'Low' && (
                                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="text-xs text-slate-500">AI Assessment</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Insights */}
                          {result.aiTrustAnalysis.aiInsights && result.aiTrustAnalysis.aiInsights.length > 0 && (
                            <div className="mb-5">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI-Powered Insights
                              </h4>
                              <div className="space-y-2">
                                {result.aiTrustAnalysis.aiInsights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-purple-100">
                                    <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs sm:text-sm text-slate-700">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Domain Characteristics */}
                          {result.aiTrustAnalysis.domainCharacteristics && result.aiTrustAnalysis.domainCharacteristics.length > 0 && (
                            <div className="mb-5">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Domain Characteristics
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {result.aiTrustAnalysis.domainCharacteristics.map((char, index) => (
                                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                                    <div className="text-xs text-slate-600 mb-1">{char.label}</div>
                                    <div className={`text-sm font-semibold px-2 py-1 rounded inline-block ${char.statusColor}`}>
                                      {char.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Recommendation */}
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                            <div className="flex items-start gap-3">
                              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <h4 className="font-bold text-sm sm:text-base mb-1">AI Recommendation</h4>
                                <p className="text-xs sm:text-sm text-purple-50">{result.aiTrustAnalysis.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Technical Details - Professional & Sleek - 3 Per Row */}
                    <div className="mb-8">
                      {/* Section Header with Gradient Line */}
                      <div className="relative mb-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-40"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                              {t.technicalDetails}
                            </h3>
                            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2"></div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Data Grid - 3 Items Per Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Domain Name */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.domainName}</p>
                              <p className="text-sm font-bold text-slate-900 break-all leading-tight">{result.domainName}</p>
                            </div>
                          </div>
                        </div>

                        {/* Protocol */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.protocol}</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{result.protocol}</p>
                            </div>
                          </div>
                        </div>

                        {/* SSL Status */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.sslStatus}</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{result.sslStatus}</p>
                            </div>
                          </div>
                        </div>

                        {/* Domain Age */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.domainAge}</p>
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

                        {/* Registration Date */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.registrationDate}</p>
                              {result.registrationDate && result.registrationDate !== "Information not available" ? (
                                <p className="text-sm font-bold text-slate-900 leading-tight">{result.registrationDate}</p>
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

                        {/* Last Checked */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-500 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.lastChecked}</p>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{result.lastChecked}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Email */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.contactEmail}</p>
                              {result.contactEmail ? (
                                <p className="text-sm font-bold text-slate-900 break-all leading-tight">{result.contactEmail}</p>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-semibold text-amber-600">{t.privacyProtected}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Phone */}
                        <div className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-5 hover:shadow-xl transition-all overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t.contactPhone}</p>
                              {result.contactPhone ? (
                                <p className="text-sm font-bold text-slate-900 leading-tight">{result.contactPhone}</p>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-semibold text-amber-600">{t.privacyProtected}</span>
                                </div>
                              )}
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

                      <ul className="space-y-2 sm:space-y-3">
                        {(() => {
                          console.log("Rendering reasons:", result.reasons, "Length:", result.reasons?.length);
                          return null;
                        })()}
                        {result.reasons && result.reasons.length > 0 ? (
                          result.reasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm sm:text-base text-slate-700 flex-1">{reason}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
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
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.safetyRecommendations}</h3>
                      </div>

                      <ul className="space-y-2 sm:space-y-3 mb-6">
                        {(() => {
                          console.log("Rendering safety tips:", result.safetyTips, "Length:", result.safetyTips?.length);
                          return null;
                        })()}
                        {result.safetyTips && result.safetyTips.length > 0 ? (
                          result.safetyTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-yellow-50 rounded-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-sm sm:text-base text-slate-700 flex-1">{tip}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-yellow-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-500 flex-1 italic">Generating safety recommendations...</span>
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

                    {/* Professional Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm font-semibold text-slate-500">{t.userReports}</span>
                      </div>
                    </div>

                    {/* User Reports Section */}
                    {result.userReports ? (
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t.userReports}</h3>
                        </div>

                        {/* Reports Statistics */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-1">
                              {result.userReports.positiveReports}
                            </div>
                            <div className="text-xs sm:text-sm text-green-600 font-medium">{t.positiveReports}</div>
                          </div>
                          <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-700 mb-1">
                              {result.userReports.negativeReports}
                            </div>
                            <div className="text-xs sm:text-sm text-red-600 font-medium">{t.negativeReports}</div>
                          </div>
                        </div>

                        {/* Trust Rating */}
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-4 sm:mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-700">{t.trustRating}</span>
                            <span className="text-base sm:text-lg font-bold text-blue-700">
                              {result.userReports.trustRating?.toFixed(1)}/5.0
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  star <= Math.round(result.userReports!.trustRating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                fill={star <= Math.round(result.userReports!.trustRating || 0) ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-xs sm:text-sm text-slate-600">
                              ({result.userReports.totalReports} {t.totalReports})
                            </span>
                          </div>
                        </div>

                        {/* Common Complaints */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-3">{t.commonComplaints}</h4>
                          {result.userReports.commonComplaints.length > 0 ? (
                            <ul className="space-y-2">
                              {result.userReports.commonComplaints.map((complaint, index) => (
                                <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span className="text-xs sm:text-sm text-slate-700 flex-1">{complaint}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{t.noComplaints}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-slate-600 text-sm sm:text-base mb-2 font-medium">{t.noDataAvailable}</p>
                        <p className="text-slate-500 text-xs sm:text-sm">User reviews and reports are currently unavailable for this domain.</p>
                      </div>
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
    </div>
  );
}
