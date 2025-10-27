# Website Security Checker - Module Structure

This directory contains the modular implementation of the Website Security Checker feature.

## Directory Structure

```
app/features/website-checker/
├── types/                  # TypeScript type definitions
│   └── index.ts           # All interfaces and types
├── constants/             # Configuration and static data
│   ├── patterns.ts        # Domain patterns, TLDs, scoring config
│   ├── translations.ts    # UI translations (English & Hindi)
│   └── index.ts          # Barrel export
├── utils/                 # Pure utility functions
│   ├── scoring.ts         # Trust score calculation logic
│   ├── detection.ts       # Phishing & scam detection
│   ├── validation.ts      # URL validation & SSL checks
│   ├── highlights.ts      # Trust highlights generation
│   └── index.ts          # Barrel export
├── services/              # API and external service calls
│   ├── whois.service.ts   # WHOIS data fetching (RDAP, who.is, ipwhois)
│   ├── ai.service.ts      # Puter AI integration
│   ├── reports.service.ts # External reports fetching
│   └── index.ts          # Barrel export
├── components/            # React UI components
│   ├── TrustScoreGauge.tsx       # Circular trust score gauge
│   ├── TrustHighlights.tsx       # Positive/negative highlights
│   ├── RegistrationInfo.tsx      # Domain registration details
│   ├── AISecurityRecommendation.tsx  # AI-powered insights
│   ├── ExternalReports.tsx       # Third-party security reports
│   ├── DomainAvailability.tsx    # Unregistered domain pricing
│   └── index.ts                  # Barrel export
├── hooks/                 # Custom React hooks
│   └── useWebsiteAnalysis.ts     # Main analysis orchestration hook
└── index.tsx              # Main route component (UI layout only)
```

## Module Responsibilities

### Types (`/types`)
- Defines all TypeScript interfaces and types
- Exports: `WebsiteAnalysis`, `PhishingDetection`, `AITrustAnalysis`, `ValidationErrors`, etc.
- Centralized type definitions for consistency

### Constants (`/constants`)
- **patterns.ts**: Domain patterns, TLD lists, scoring thresholds, API URLs
  - Government domain patterns (regex)
  - Country-to-domain mapping
  - Trusted/suspicious TLDs and registrars
  - Special domain scores (.edu, .gov)
- **translations.ts**: UI text in multiple languages (English, Hindi)
- No business logic, only static configuration

### Utils (`/utils`)
- **scoring.ts**: Trust score calculation algorithm
  - Special handling for .edu and government domains
  - Domain age, SSL, phishing, TLD, registrar scoring
  - Verdict generation based on score
- **detection.ts**: Security threat detection
  - Scam keyword detection
  - Phishing pattern analysis (brand impersonation, suspicious characters)
- **validation.ts**: Input validation and parsing
  - URL format validation
  - SSL analysis
  - Domain extraction
  - Domain age calculation
- **highlights.ts**: Trust highlights generation
  - Positive/negative indicator generation
  - Special messaging for institutional domains

### Services (`/services`)
Will contain:
- **whois.service.ts**: Domain registration data fetching
  - RDAP API integration
  - who.is API fallback
  - ipwhois.io API fallback
  - WHOIS data parsing and extraction
- **ai.service.ts**: AI-powered analysis
  - Puter AI integration
  - Trust analysis generation
  - Safety recommendations
- **reports.service.ts**: External security reports
  - VirusTotal integration
  - URLScan integration
  - Google Safe Browsing integration

### Components (`/components`)
Will contain reusable UI components:
- **TrustScoreGauge.tsx**: SVG circular gauge with score display
- **TrustHighlights.tsx**: Card showing positive/negative indicators
- **RegistrationInfo.tsx**: Domain registration details with badges
- **AISecurityRecommendation.tsx**: AI-generated insights and advice
- **ExternalReports.tsx**: Grid of third-party security report links
- **DomainAvailability.tsx**: Pricing information for unregistered domains

### Hooks (`/hooks`)
Will contain:
- **useWebsiteAnalysis.ts**: Main analysis orchestration
  - Manages all state
  - Coordinates service calls
  - Handles loading/error states
  - Composes results from multiple sources

### Main Route (`/index.tsx`)
- Lightweight UI layout component
- Uses custom hooks for logic
- Composes UI components
- Minimal business logic (orchestration only)

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a single, clear responsibility
2. **Testability**: Pure functions in utils/ are easy to unit test
3. **Reusability**: Components and utilities can be used elsewhere
4. **Maintainability**: Easy to locate and modify specific functionality
5. **Scalability**: New features can be added without bloating existing files
6. **Type Safety**: Centralized types ensure consistency
7. **Code Navigation**: Clear file names make finding code intuitive

## Next Steps

1. ✅ Create directory structure
2. ✅ Extract types to `/types`
3. ✅ Extract constants to `/constants`
4. ✅ Extract utilities to `/utils`
5. ⏳ Extract service functions to `/services`
6. ⏳ Extract UI components to `/components`
7. ⏳ Create custom hooks in `/hooks`
8. ⏳ Update main route to use modular imports
9. ⏳ Test all functionality
10. ⏳ Remove old monolithic file

## Import Examples

```typescript
// Types
import type { WebsiteAnalysis, PhishingDetection } from '~/features/website-checker/types';

// Constants
import { COUNTRY_GOV_PATTERNS, SPECIAL_DOMAIN_SCORES, translations } from '~/features/website-checker/constants';

// Utilities
import { calculateTrustScore, detectPhishingPatterns, generateTrustHighlights } from '~/features/website-checker/utils';

// Services (once created)
import { fetchDomainDetails, generateAITrustAnalysis } from '~/features/website-checker/services';

// Components (once created)
import { TrustScoreGauge, TrustHighlights, RegistrationInfo } from '~/features/website-checker/components';

// Hooks (once created)
import { useWebsiteAnalysis } from '~/features/website-checker/hooks';
```

## Code Style Guidelines

- Use TypeScript for all files
- Export types using `type` keyword imports
- Use named exports (avoid default exports except for components)
- Document complex functions with JSDoc comments
- Keep functions pure when possible (no side effects)
- Use descriptive variable and function names
- Follow existing code formatting conventions
