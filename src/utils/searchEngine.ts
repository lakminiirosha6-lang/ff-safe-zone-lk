import { TrustedSeller, ScamRecord } from '../types';

export function normalizePhone(phone: string): string {
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // Normalize +94 to 0
  if (digits.startsWith('94') && digits.length >= 11) {
    return '0' + digits.slice(2);
  }
  return digits;
}

export interface DetailedSearchResult {
  query: string;
  verdict: 'SCAMMER' | 'TRUSTED' | 'IMPERSONATION_ALERT' | 'NOT_FOUND';
  matchedScammers: ScamRecord[];
  matchedTrusted: TrustedSeller[];
}

export function performCommunitySearch(
  rawQuery: string,
  trustedSellers: TrustedSeller[],
  scamRecords: ScamRecord[]
): DetailedSearchResult {
  const query = rawQuery.trim();
  if (!query) {
    return {
      query: '',
      verdict: 'NOT_FOUND',
      matchedScammers: [],
      matchedTrusted: [],
    };
  }

  const queryLower = query.toLowerCase();
  const queryPhoneDigits = normalizePhone(query);

  // Check Scammers
  const matchedScammers = scamRecords.filter((s) => {
    // Check name
    if (s.name.toLowerCase().includes(queryLower)) return true;
    // Check aliases
    if (s.aliases && s.aliases.some((a) => a.toLowerCase().includes(queryLower))) return true;
    // Check phone
    const sPhoneDigits = normalizePhone(s.whatsapp);
    if (queryPhoneDigits && queryPhoneDigits.length >= 7) {
      if (sPhoneDigits.includes(queryPhoneDigits) || queryPhoneDigits.includes(sPhoneDigits)) return true;
    }
    // Check UID
    if (s.freefireUid && s.freefireUid.includes(query)) return true;
    // Check Facebook
    if (s.facebookUrl && s.facebookUrl.toLowerCase().includes(queryLower)) return true;
    // Check Bank details
    if (s.bankDetails && s.bankDetails.toLowerCase().includes(queryLower)) return true;
    return false;
  });

  // Check Trusted
  const matchedTrusted = trustedSellers.filter((t) => {
    // Check name
    if (t.name.toLowerCase().includes(queryLower)) return true;
    // Check phone
    const tPhoneDigits = normalizePhone(t.whatsapp);
    if (queryPhoneDigits && queryPhoneDigits.length >= 7) {
      if (tPhoneDigits.includes(queryPhoneDigits) || queryPhoneDigits.includes(tPhoneDigits)) return true;
    }
    // Check UID
    if (t.freefireUid && t.freefireUid.includes(query)) return true;
    // Check Facebook
    if (t.facebookUrl && t.facebookUrl.toLowerCase().includes(queryLower)) return true;
    // Check role or payment
    if (t.role.toLowerCase().includes(queryLower)) return true;
    return false;
  });

  let verdict: DetailedSearchResult['verdict'] = 'NOT_FOUND';
  if (matchedScammers.length > 0 && matchedTrusted.length > 0) {
    verdict = 'IMPERSONATION_ALERT';
  } else if (matchedScammers.length > 0) {
    verdict = 'SCAMMER';
  } else if (matchedTrusted.length > 0) {
    verdict = 'TRUSTED';
  } else {
    verdict = 'NOT_FOUND';
  }

  return {
    query,
    verdict,
    matchedScammers,
    matchedTrusted,
  };
}
