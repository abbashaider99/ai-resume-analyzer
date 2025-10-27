/**
 * Translations for Website Security Checker
 */

import type { Language } from '../types';

export interface Translations {
  title: string;
  subtitle: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  analyzeButton: string;
  analyzing: string;
  resetButton: string;
  trustScore: string;
  verdict: string;
  keyFindings: string;
  safetyRecommendations: string;
  technicalDetails: string;
  domainAge: string;
  sslStatus: string;
  registrar: string;
  domainName: string;
  protocol: string;
  lastChecked: string;
  registrationDate: string;
  contactEmail: string;
  contactPhone: string;
  userReports: string;
  totalReports: string;
  positiveReports: string;
  negativeReports: string;
  trustRating: string;
  externalReports: string;
  externalReportsDesc: string;
  viewReport: string;
  commonComplaints: string;
  noComplaints: string;
  notAvailable: string;
  privacyProtected: string;
  noDataAvailable: string;
  phishingWarning: string;
  phishingDetected: string;
  phishingConfidence: string;
  suspiciousPatterns: string;
  likelyImpersonating: string;
  phishingDescription: string;
}

export const translations: Record<Language, Translations> = {
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
