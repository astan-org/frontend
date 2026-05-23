import type { CPARResult, IncidentInput } from './types';
import { PLATFORMS } from './constants';

export function classify(incident: IncidentInput): CPARResult {
  const t = incident.text.toLowerCase();

  const childSignals = ['minor', 'grooming', 'child', 'csam', 'photos', 'photo', 'school', 'underage'];
  const isChild = childSignals.some(k => t.includes(k));

  if (isChild) {
    return {
      risk_level: 'critical',
      harm_type: t.includes('csam')
        ? 'Child Safety — CSAM Material'
        : t.includes('grooming') || t.includes('minor')
          ? 'Child Safety — Grooming Pattern'
          : 'Child Safety Concern',
      severity: 10,
      confidence: 96,
      summary:
        'Suspected child safety violation detected. Cross-platform actor pattern with grooming or exploitation indicators. NCMEC mandatory escalation triggered.',
      ai_reasoning:
        'The signals — minor targeting, platform migration request, account-creation recency, and behavioural pattern — match a documented grooming methodology. Severity is overridden to maximum per CPAR child-safety protocol; NCMEC reporting is mandatory under 18 U.S.C. § 2258A regardless of confidence margin.',
      matched_policies: ['DSA·Art.17', 'COPPA·§312', 'NCMEC·§2258A', 'TikTok CG·4.1', 'Discord CG·5'],
      dispatch_targets: ['TikTok', 'Meta (Facebook/Instagram)', 'Discord', 'Roblox', 'Snapchat'],
      platform_actions: {
        'TikTok': 'preserve evidence + suspend',
        'Meta (Facebook/Instagram)': 'cross-reference handle + suspend',
        'Discord': 'remove account + preserve DMs',
        'Roblox': 'block account + alert moderators',
        'Snapchat': 'preserve evidence + suspend',
      },
      legal_basis: 'EU DSA Art. 17 · COPPA · 18 U.S.C. § 2258A (NCMEC mandatory)',
      compliance_flags: ['NCMEC_MANDATORY', 'DSA_ART17', 'CHILD_SAFETY_OVERRIDE'],
      actor_persistence_risk: 'High — pattern matches 3 prior accounts',
      estimated_reach: 'Up to 14 minors across 2 platforms',
      ncmec_required: true,
    };
  }

  if (t.includes('scam') || t.includes('investment') || t.includes('gift card')) {
    return {
      risk_level: 'high',
      harm_type: 'Coordinated Financial Scam',
      severity: 8,
      confidence: 89,
      summary:
        'Coordinated scam network identified. Multi-account behaviour with social-engineering toward off-platform payment channels. Time-sensitive.',
      ai_reasoning:
        'The combination of coordinated livestream activity, recurring "investment" pitch, redirection to off-platform messaging and victim demographic skew matches a known organised scam structure. Cross-platform takedown will prevent migration to mirror accounts.',
      matched_policies: ['DSA·Art.17', 'FTC·Sec.5', 'TikTok·CG-3.2', 'Meta·CS-2.4'],
      dispatch_targets: ['TikTok', 'Meta (Facebook/Instagram)', 'Snapchat'],
      platform_actions: {
        'TikTok': 'suspend network + preserve livestream archives',
        'Meta (Facebook/Instagram)': 'cross-reference handles + monitor',
        'Snapchat': 'block redirect URLs',
      },
      legal_basis: 'EU DSA Art. 17 · FTC Act §5 · UK Online Safety Act',
      compliance_flags: ['DSA_ART17', 'FINANCIAL_HARM', 'COORDINATED_INAUTHENTIC'],
      actor_persistence_risk: 'High — coordinated network',
      estimated_reach: '~$40k reported losses, 72h window',
      ncmec_required: false,
    };
  }

  if (t.includes('impersonat') || t.includes('fake account')) {
    return {
      risk_level: 'high',
      harm_type: 'Public Figure Impersonation',
      severity: 7,
      confidence: 92,
      summary:
        'Impersonation of verified public figure with fabricated content. Reputation damage and misinformation spread.',
      ai_reasoning:
        'Account behaviour — rapid follower growth, fabricated screenshots, and verified-target impersonation — matches established impersonation patterns. The original verified party has filed report, increasing legal urgency.',
      matched_policies: ['DSA·Art.17', 'Meta·CS-1.3', 'EU GDPR·Art.17'],
      dispatch_targets: ['Meta (Facebook/Instagram)', 'TikTok'],
      platform_actions: {
        'Meta (Facebook/Instagram)': 'suspend impersonator + restore reputation',
        'TikTok': 'cross-reference handle + monitor',
      },
      legal_basis: 'EU DSA Art. 17 · GDPR Art. 17 (right to erasure)',
      compliance_flags: ['DSA_ART17', 'IMPERSONATION'],
      actor_persistence_risk: 'Medium — single-account so far',
      estimated_reach: '14k followers in 48h',
      ncmec_required: false,
    };
  }

  if (t.includes('harass') || t.includes('threat')) {
    return {
      risk_level: 'medium',
      harm_type: 'Repeated Cross-Platform Harassment',
      severity: 6,
      confidence: 84,
      summary:
        'Persistent harassment of a single victim across Roblox and Discord. Behaviour escalation noted.',
      ai_reasoning:
        'Three prior reports with consistent actor pattern, escalation toward threatening language, and cross-platform persistence indicate organised harassment. Cross-platform action prevents the actor from continuing on alternative surfaces.',
      matched_policies: ['DSA·Art.17', 'Roblox·CG-7', 'Discord·CG-5'],
      dispatch_targets: ['Discord', 'Roblox'],
      platform_actions: {
        'Discord': 'ban account + preserve message history',
        'Roblox': 'block account + protect victim profile',
      },
      legal_basis: 'EU DSA Art. 17 · UK Online Safety Act',
      compliance_flags: ['DSA_ART17', 'HARASSMENT_REPEAT'],
      actor_persistence_risk: 'Medium — 3 prior reports',
      estimated_reach: 'Single victim, escalating',
      ncmec_required: false,
    };
  }

  if (t.includes('zoom') || t.includes('raid')) {
    return {
      risk_level: 'medium',
      harm_type: 'Coordinated Disruption · Hate Speech',
      severity: 5,
      confidence: 81,
      summary:
        'Coordinated Zoom raid originating from Discord server, hateful imagery and slurs against a school session.',
      ai_reasoning:
        'Origin server identifiable in Discord; raid coordination is observable in pre-raid messages. Joint takedown necessary to prevent further coordinated events.',
      matched_policies: ['DSA·Art.17', 'Zoom·CG-2', 'Discord·CG-4'],
      dispatch_targets: ['Zoom', 'Discord'],
      platform_actions: {
        'Zoom': 'lock targeted meeting + revoke session keys',
        'Discord': 'investigate origin server + remove coordination channel',
      },
      legal_basis: 'EU DSA Art. 17 · Hate Speech statutes',
      compliance_flags: ['DSA_ART17', 'HATE_SPEECH', 'COORDINATED'],
      actor_persistence_risk: 'Medium — group activity',
      estimated_reach: 'School session, ~30 students',
      ncmec_required: false,
    };
  }

  return {
    risk_level: 'low',
    harm_type: 'General Safety Concern',
    severity: 3,
    confidence: 72,
    summary:
      'Report does not strongly match any high-severity pattern. Routed for analyst review with standard dispatch envelope.',
    ai_reasoning:
      'Signals are limited and ambiguous. The report is logged, classified at low severity, and routed to the originating platform only. No cross-platform escalation is justified by available evidence at this time.',
    matched_policies: ['DSA·Art.17'],
    dispatch_targets: [PLATFORMS[0].name],
    platform_actions: { [PLATFORMS[0].name]: 'log report + monitor account' },
    legal_basis: 'EU DSA Art. 17',
    compliance_flags: ['DSA_ART17'],
    actor_persistence_risk: 'Low',
    estimated_reach: 'Single account',
    ncmec_required: false,
  };
}
