export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type SourceMode = 'user' | 'analyst';
export type DemoState = 'idle' | 'loading' | 'classified' | 'dispatching' | 'complete' | 'error';
export type PlatformStatus = 'standby' | 'notifying' | 'complete';

export interface CPARResult {
  risk_level: RiskLevel;
  harm_type: string;
  severity: number;
  confidence: number;
  summary: string;
  ai_reasoning: string;
  matched_policies: string[];
  dispatch_targets: string[];
  platform_actions: Record<string, string>;
  legal_basis: string;
  compliance_flags: string[];
  actor_persistence_risk: string;
  estimated_reach: string;
  ncmec_required: boolean;
  _id?: string;
  _time?: string;
}

export interface IncidentInput {
  text: string;
  platform: string;
  harm: string | null;
}
