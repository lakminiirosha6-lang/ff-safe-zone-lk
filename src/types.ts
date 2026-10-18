export type SellerRole = 'Official Middleman' | 'Diamond Top-Up' | 'Account Dealer' | 'Guild Leader' | 'Verified Trader';

export interface TrustedSeller {
  id: string;
  name: string;
  role: SellerRole;
  whatsapp: string;
  facebookUrl: string;
  freefireUid: string;
  vouchesCount: number;
  rating: number; // e.g. 5.0
  paymentMethods: string[]; // e.g. ["FriMi", "Commercial Bank", "eZ Cash"]
  verifiedDate: string;
  badgeLevel: 'Diamond' | 'Gold' | 'Master';
  notes?: string;
  isOfficialMiddleman: boolean;
}

export type ScamType = 
  | 'Fake Middleman Impersonation'
  | 'Account Sale Scam (Took money, no login)'
  | 'Account Recovery Fraud (Retrieved after sale)'
  | 'Fake Payment Slip / FriMi Scam'
  | 'Diamond Top-Up Scam'
  | 'Phishing Link / Login Hack';

export interface ScamRecord {
  id: string;
  name: string;
  aliases: string[];
  whatsapp: string;
  facebookUrl: string;
  freefireUid: string;
  bankDetails: string; // e.g. "Commercial Bank 8001234567 (K. Perera) / eZ Cash 077xxxxxxx"
  scamAmountLkr: number;
  scamType: ScamType;
  incidentDetails: string;
  proofUrls: string[];
  dateReported: string;
  status: 'Confirmed Scammer' | 'Banned Criminal' | 'Under Police Complaint';
  reporterInfo?: string;
}

export interface PendingReport {
  id: string;
  scammerName: string;
  scammerWhatsapp: string;
  scammerFacebook: string;
  scammerUid: string;
  bankDetails: string;
  scamAmountLkr: number;
  scamType: ScamType;
  incidentDetails: string;
  proofUrls: string[];
  reporterContact: string;
  submittedAt: string;
}

export type SearchVerdict = 'SCAMMER' | 'TRUSTED' | 'NOT_FOUND' | null;

export interface SearchMatch {
  verdict: SearchVerdict;
  trusted?: TrustedSeller;
  scammer?: ScamRecord;
  query: string;
}
