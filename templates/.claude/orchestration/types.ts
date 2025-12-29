/**
 * Type definitions for orchestration system
 */

export interface Skill {
  id: string;
  version: string;
  category: string;
  keywords: string[];
  dependencies: string[];
  docs: {
    url: string;
    lastPulled: string | null;
    hash: string | null;
  };
  semanticTags?: {
    primary: string[];
    secondary: string[];
    domains: string[];
  };
  capabilities?: {
    inputs: string[];
    outputs: string[];
    actions: string[];
  };
  orchestration?: {
    priority: number;
    cooperationLevel: 'low' | 'medium' | 'high';
    parallelizable: boolean;
    estimatedTokens: number;
    activationThreshold: number;
  };
  dependencies?: {
    recommended: string[];
    complements: string[];
  };
  collaboration?: {
    canProvideDataTo: string[];
    canConsumeDataFrom: string[];
    sharedContext: string[];
  };
}

export interface SkillScore {
  skill: Skill;
  totalScore: number;
  breakdown: {
    semanticMatch: number;    // 35% weight
    keywordMatch: number;     // 25% weight
    contextRelevance: number; // 20% weight
    userHistory: number;      // 10% weight
    skillPriority: number;    // 10% weight
  };
}

export enum WorkflowPattern {
  SEQUENTIAL = 'sequential',   // A → B → C
  PARALLEL = 'parallel',        // [A, B, C] → merge
  HIERARCHICAL = 'hierarchical', // Parent → [Children]
  ITERATIVE = 'iterative'       // A → check → B → check
}

export interface WorkflowStep {
  type: WorkflowPattern;
  tasks: WorkflowTask[];
  parent?: WorkflowTask;
  children?: WorkflowTask[];
  task?: WorkflowTask;
  condition?: (result: any) => boolean;
  maxIterations?: number;
}

export interface WorkflowTask {
  skillId: string;
  query: string;
  parameters?: Record<string, any>;
  dependsOn?: string[];
  sharesDataWith?: string[];
  timeout?: number;
}

export interface Workflow {
  id: string;
  pattern: WorkflowPattern;
  steps: WorkflowStep[];
  metadata: {
    query: string;
    skillIds: string[];
    estimatedTokens: number;
    estimatedDuration: number;
    created: number;
  };
}

export interface Message {
  from: string;
  to: string[];
  data: any;
  timestamp: number;
  type?: 'request' | 'response' | 'broadcast';
}

export interface OrchestratorConfig {
  enableSemanticMatching: boolean;
  maxActiveSkills: number;
  semanticThreshold: number;
  cacheEmbeddings: boolean;
  embeddingModel?: string;
  embeddingProvider?: 'openai' | 'anthropic' | 'local';
}

export interface EmbeddingCache {
  skillId: string;
  embedding: number[];
  text: string;
  timestamp: number;
  model: string;
}

export interface RankingWeights {
  semanticMatch: number;
  keywordMatch: number;
  contextRelevance: number;
  userHistory: number;
  skillPriority: number;
}

export interface UserContext {
  recentSkills: string[];
  preferredSkills: string[];
  skillSuccessRates: Record<string, number>;
  commonCombinations: string[][];
}
