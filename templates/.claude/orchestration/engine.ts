/**
 * Orchestration Engine
 * Main controller for multi-skill coordination and workflow planning
 */

import { Skill, SkillScore, Workflow, WorkflowPattern, OrchestratorConfig } from './types';
import { SemanticMatcher } from './semantic-matcher';
import { SkillRanker } from './ranker';
import { WorkflowPlanner } from './workflow-planner';
import { DependencyResolver } from './dependency-resolver';
import { SkillMessageBus } from './message-bus';
import { ContextStore } from './context-store';

export class OrchestrationEngine {
  private semanticMatcher: SemanticMatcher;
  private ranker: SkillRanker;
  private planner: WorkflowPlanner;
  private resolver: DependencyResolver;
  private messageBus: SkillMessageBus;
  private contextStore: ContextStore;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.semanticMatcher = new SemanticMatcher(config);
    this.ranker = new SkillRanker(config);
    this.planner = new WorkflowPlanner(config);
    this.resolver = new DependencyResolver();
    this.messageBus = new SkillMessageBus();
    this.contextStore = new ContextStore();
  }

  /**
   * Select relevant skills for a query
   * @param query - User query
   * @param availableSkills - All available skills
   * @returns Selected skills
   */
  async selectSkills(query: string, availableSkills: Skill[]): Promise<Skill[]> {
    // 1. Calculate semantic matches
    const matches = await Promise.all(
      availableSkills.map(async (skill) => ({
        skill,
        score: await this.semanticMatcher.calculateMatch(query, skill)
      }))
    );

    // 2. Filter by activation threshold
    const candidates = matches.filter(
      m => m.score >= (m.skill.orchestration?.activationThreshold || 0.7)
    );

    // 3. Rank skills
    const ranked = await this.ranker.rankSkills(query, candidates.map(c => c.skill));

    // 4. Apply max skills limit
    const maxSkills = this.config.maxActiveSkills || 5;
    const selected = ranked.slice(0, maxSkills);

    return selected.map(s => s.skill);
  }

  /**
   * Rank skills by relevance and capability
   * @param query - User query
   * @param skills - Skills to rank
   * @returns Ranked skills with scores
   */
  async rankSkills(query: string, skills: Skill[]): Promise<SkillScore[]> {
    return this.ranker.rankSkills(query, skills);
  }

  /**
   * Plan workflow for selected skills
   * @param skills - Selected skills
   * @param query - User query
   * @param context - Additional context
   * @returns Planned workflow
   */
  async planWorkflow(
    skills: Skill[],
    query: string,
    context?: Record<string, any>
  ): Promise<Workflow> {
    // 1. Resolve dependencies
    const orderedSkills = this.resolver.resolveDependencies(skills);

    // 2. Detect workflow pattern
    const pattern = this.planner.detectPattern(orderedSkills, query);

    // 3. Generate workflow
    const workflow = this.planner.generateWorkflow(
      orderedSkills,
      pattern,
      query,
      context
    );

    // 4. Optimize workflow
    const optimized = this.planner.optimize(workflow);

    return optimized;
  }

  /**
   * Execute a planned workflow
   * @param workflow - Workflow to execute
   * @returns Execution result
   */
  async executeWorkflow(workflow: Workflow): Promise<any> {
    const results: Record<string, any> = {};

    for (const step of workflow.steps) {
      switch (step.type) {
        case 'sequential':
          for (const task of step.tasks) {
            const result = await this.executeTask(task, results);
            results[task.skillId] = result;

            // Share data via message bus
            this.messageBus.publish({
              from: task.skillId,
              to: task.sharesDataWith || [],
              data: result,
              timestamp: Date.now()
            });
          }
          break;

        case 'parallel':
          const parallelResults = await Promise.all(
            step.tasks.map(task => this.executeTask(task, results))
          );

          step.tasks.forEach((task, idx) => {
            results[task.skillId] = parallelResults[idx];
          });
          break;

        case 'hierarchical':
          // Execute parent first
          const parentResult = await this.executeTask(step.parent, results);
          results[step.parent.skillId] = parentResult;

          // Then execute children
          const childResults = await Promise.all(
            step.children.map(task => this.executeTask(task, results))
          );

          step.children.forEach((task, idx) => {
            results[task.skillId] = childResults[idx];
          });
          break;

        case 'iterative':
          let iterationResult = null;
          let continueIterating = true;
          let iterationCount = 0;
          const maxIterations = step.maxIterations || 10;

          while (continueIterating && iterationCount < maxIterations) {
            iterationResult = await this.executeTask(step.task, results);
            continueIterating = step.condition(iterationResult);
            iterationCount++;
          }

          results[step.task.skillId] = iterationResult;
          break;
      }
    }

    return {
      success: true,
      results,
      workflow,
      timestamp: Date.now()
    };
  }

  /**
   * Execute a single task
   * @param task - Task to execute
   * @param context - Execution context
   * @returns Task result
   */
  private async executeTask(
    task: any,
    context: Record<string, any>
  ): Promise<any> {
    // Get shared context from dependencies
    const sharedData = task.dependsOn?.map((depId: string) => context[depId]) || [];

    // Store in context store
    this.contextStore.set(`task.${task.skillId}.input`, sharedData, 'global');

    // Execute skill-specific logic
    // (In practice, this would invoke the skill)
    const result = await this.invokeSkill(task.skillId, {
      query: task.query,
      context: sharedData,
      parameters: task.parameters
    });

    // Store result
    this.contextStore.set(`task.${task.skillId}.output`, result, 'global');

    return result;
  }

  /**
   * Invoke a skill
   * @param skillId - Skill ID
   * @param params - Invocation parameters
   * @returns Skill result
   */
  private async invokeSkill(skillId: string, params: any): Promise<any> {
    // Placeholder - in practice would invoke actual skill
    return {
      skillId,
      success: true,
      data: params,
      timestamp: Date.now()
    };
  }

  /**
   * Get orchestration statistics
   * @returns Statistics
   */
  getStats(): any {
    return {
      cachedEmbeddings: this.semanticMatcher.getCacheStats(),
      activeWorkflows: 0, // Track active workflows
      totalExecutions: 0, // Track total executions
      averageExecutionTime: 0
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.semanticMatcher.clearCache();
    this.contextStore.clear();
  }
}

/**
 * Create and configure orchestration engine
 * @param config - Configuration
 * @returns Configured engine
 */
export function createEngine(config?: Partial<OrchestratorConfig>): OrchestrationEngine {
  const defaultConfig: OrchestratorConfig = {
    enableSemanticMatching: true,
    maxActiveSkills: 5,
    semanticThreshold: 0.7,
    cacheEmbeddings: true,
    ...config
  };

  return new OrchestrationEngine(defaultConfig);
}
