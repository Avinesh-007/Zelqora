export type Role = 'user' | 'assistant' | 'system';

export type InvestigationStatus = 'active' | 'resolved' | 'abandoned';

export type GuideStatus = 
  | 'draft' 
  | 'in_review' 
  | 'approved' 
  | 'published' 
  | 'needs_review' 
  | 'archived';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface EnvironmentInfo {
  os?: string;
  runtime?: string;
  version?: string;
  framework?: string;
  error_message?: string;
  reproduction_steps?: string;
  config_context?: string;
  logs?: string;
}

export interface Hypothesis {
  id: string;
  title: string;
  explanation: string;
  likelihood_score: number; // 0 - 100
  supporting_evidence: string[];
  refuting_evidence?: string[];
}

export interface DiagnosticTest {
  id: string;
  title: string;
  command: string;
  is_safe: boolean;
  requires_elevation: boolean;
  explanation: string;
  expected_output_pattern: string;
  what_result_means: {
    if_matches: string;
    if_fails_or_differs: string;
  };
}

export interface SolutionStep {
  step_number: number;
  title: string;
  instructions: string;
  code_snippet?: string;
  language?: string;
  caution_notes?: string;
  rollback_instructions?: string;
}

export interface DocumentationRef {
  title: string;
  url: string;
  source_name: string; // e.g. "Node.js Official Docs", "Docker Docs", "MDN"
  relevant_excerpt?: string;
  verified: boolean;
}

export interface DiagnosticAssessment {
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  clarifying_questions: string[];
  hypotheses: Hypothesis[];
  diagnostic_tests: DiagnosticTest[];
  recommended_solution?: SolutionStep[];
  documentation_references: DocumentationRef[];
  is_conclusive: boolean;
  safety_warnings: string[];
}

export interface InvestigationTurn {
  id: string;
  investigation_id: string;
  turn_index: number;
  user_input: {
    description?: string;
    environment?: EnvironmentInfo;
    submitted_test_output?: string;
    answered_questions?: Record<string, string>;
  };
  assessment: DiagnosticAssessment;
  created_at: string;
}

export interface Investigation {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  title: string;
  category: string;
  initial_description: string;
  environment: EnvironmentInfo;
  status: InvestigationStatus;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  turns?: InvestigationTurn[];
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  symptoms: string[];
  environment_prereqs: string[];
  likely_causes: {
    cause: string;
    explanation: string;
  }[];
  diagnostic_steps: {
    step: string;
    command?: string;
    interpretation: string;
  }[];
  verified_solutions: {
    title: string;
    steps: string[];
    code_snippet?: string;
    language?: string;
    rollback?: string;
  }[];
  warnings: string[];
  documentation_references: DocumentationRef[];
  status: GuideStatus;
  author_name: string;
  last_reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface DocSource {
  id: string;
  name: string;
  category: string;
  base_url: string;
  search_pattern: string;
  description: string;
  verified_topics: {
    topic: string;
    title: string;
    url: string;
    summary: string;
  }[];
}
