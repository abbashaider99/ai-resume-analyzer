/**
 * Type definitions for Website Security Checker
 */

export interface WebsiteAnalysis {
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
  registrantCountry?: string | null;
  registrantState?: string | null;
  nameservers?: string[];
  phishingDetection?: PhishingDetection;
  userReports?: UserReports;
  aiTrustAnalysis?: AITrustAnalysis;
  externalReports?: ExternalReport[];
  trustHighlights?: TrustHighlights;
}

export interface PhishingDetection {
  isPhishing: boolean;
  confidence: number;
  patterns: string[];
  likelyTarget?: string;
}

export interface UserReports {
  totalReports: number;
  positiveReports: number;
  negativeReports: number;
  commonComplaints: string[];
  trustRating?: number;
}

export interface AITrustAnalysis {
  trustLikelihood: number;
  riskLevel: string;
  riskColor: string;
  aiInsights: string[];
  domainCharacteristics: DomainCharacteristic[];
  recommendation: string;
}

export interface DomainCharacteristic {
  label: string;
  status: string;
  statusColor: string;
}

export interface ExternalReport {
  source: string;
  name: string;
  url: string;
  rating?: string;
  description?: string;
  icon?: string;
}

export interface TrustHighlights {
  positive: string[];
  negative: string[];
}

export interface ValidationErrors {
  url?: string;
}

export interface PricingOffer {
  provider: string;
  url: string;
  price: string | null;
  offer: string | null;
  freebies?: string[];
}

export interface DomainDetails {
  registrationDate: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  registrantContact?: string | null;
  registrantCountry?: string | null;
  registrantState?: string | null;
  nameservers?: string[];
}

export type Language = "en" | "hi";
