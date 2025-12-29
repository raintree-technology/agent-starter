/**
 * Workflow Planner
 * Pattern detection and workflow generation
 */

import { Skill, Workflow, WorkflowPattern, WorkflowStep, WorkflowTask, OrchestratorConfig } from './types';

export class WorkflowPlanner {
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  /**
   * Detect optimal workflow pattern
   * @param skills - Selected skills
   * @param query - User query
   * @returns Detected pattern
   */
  detectPattern(skills: Skill[], query: string): WorkflowPattern {
    // Sequential if skills have strict dependencies
    if (this.hasStrictDependencies(skills)) {
      return WorkflowPattern.SEQUENTIAL;
    }

    // Parallel if skills are independent
    if (this.areIndependent(skills)) {
      return WorkflowPattern.PARALLEL;
    }

    // Hierarchical if one skill coordinates others
    if (this.hasCoordinator(skills)) {
      return WorkflowPattern.HIERARCHICAL;
    }

    // Iterative if query suggests iteration
    if (this.needsIteration(query)) {
      return WorkflowPattern.ITERATIVE;
    }

    // Default to sequential
    return WorkflowPattern.SEQUENTIAL;
  }

  /**
   * Generate workflow from skills and pattern
   * @param skills - Ordered skills
   * @param pattern - Workflow pattern
   * @param query - User query
   * @param context - Additional context
   * @returns Generated workflow
   */
  generateWorkflow(
    skills: Skill[],
    pattern: WorkflowPattern,
    query: string,
    context?: Record<string, any>
  ): Workflow {
    const workflow: Workflow = {
      id: this.generateWorkflowId(),
      pattern,
      steps: [],
      metadata: {
        query,
        skillIds: skills.map(s => s.id),
        estimatedTokens: skills.reduce((sum, s) => sum + (s.orchestration?.estimatedTokens || 0), 0),
        estimatedDuration: this.estimateDuration(skills, pattern),
        created: Date.now()
      }
    };

    switch (pattern) {
      case WorkflowPattern.SEQUENTIAL:
        workflow.steps = this.generateSequentialSteps(skills, query);
        break;

      case WorkflowPattern.PARALLEL:
        workflow.steps = this.generateParallelSteps(skills, query);
        break;

      case WorkflowPattern.HIERARCHICAL:
        workflow.steps = this.generateHierarchicalSteps(skills, query);
        break;

      case WorkflowPattern.ITERATIVE:
        workflow.steps = this.generateIterativeSteps(skills, query);
        break;
    }

    return workflow;
  }

  /**
   * Generate sequential workflow steps
   * @param skills - Skills
   * @param query - Query
   * @returns Steps
   */
  private generateSequentialSteps(skills: Skill[], query: string): WorkflowStep[] {
    const tasks: WorkflowTask[] = skills.map((skill, index) => ({
      skillId: skill.id,
      query,
      dependsOn: index > 0 ? [skills[index - 1].id] : [],
      sharesDataWith: this.getDataSharingTargets(skill, skills)
    }));

    return [{
      type: WorkflowPattern.SEQUENTIAL,
      tasks
    }];
  }

  /**
   * Generate parallel workflow steps
   * @param skills - Skills
   * @param query - Query
   * @returns Steps
   */
  private generateParallelSteps(skills: Skill[], query: string): WorkflowStep[] {
    const tasks: WorkflowTask[] = skills.map(skill => ({
      skillId: skill.id,
      query,
      dependsOn: [],
      sharesDataWith: this.getDataSharingTargets(skill, skills)
    }));

    return [{
      type: WorkflowPattern.PARALLEL,
      tasks
    }];
  }

  /**
   * Generate hierarchical workflow steps
   * @param skills - Skills
   * @param query - Query
   * @returns Steps
   */
  private generateHierarchicalSteps(skills: Skill[], query: string): WorkflowStep[] {
    // Find coordinator (highest priority skill)
    const coordinator = skills.reduce((max, skill) =>
      (skill.orchestration?.priority || 0) > (max.orchestration?.priority || 0) ? skill : max
    );

    const children = skills.filter(s => s.id !== coordinator.id);

    return [{
      type: WorkflowPattern.HIERARCHICAL,
      tasks: [],
      parent: {
        skillId: coordinator.id,
        query,
        dependsOn: []
      },
      children: children.map(skill => ({
        skillId: skill.id,
        query,
        dependsOn: [coordinator.id],
        sharesDataWith: this.getDataSharingTargets(skill, skills)
      }))
    }];
  }

  /**
   * Generate iterative workflow steps
   * @param skills - Skills
   * @param query - Query
   * @returns Steps
   */
  private generateIterativeSteps(skills: Skill[], query: string): WorkflowStep[] {
    // Use first skill as iterator
    const iterator = skills[0];

    return [{
      type: WorkflowPattern.ITERATIVE,
      tasks: [],
      task: {
        skillId: iterator.id,
        query,
        dependsOn: []
      },
      condition: (result: any) => {
        // Default condition: iterate if result indicates more work
        return result?.continue === true;
      },
      maxIterations: 10
    }];
  }

  /**
   * Optimize workflow
   * @param workflow - Workflow to optimize
   * @returns Optimized workflow
   */
  optimize(workflow: Workflow): Workflow {
    // Merge parallel steps where possible
    const optimized = { ...workflow };

    // Identify parallelizable sequential steps
    for (let i = 0; i < optimized.steps.length; i++) {
      const step = optimized.steps[i];

      if (step.type === WorkflowPattern.SEQUENTIAL) {
        const parallelGroups = this.findParallelizableGroups(step.tasks);

        if (parallelGroups.length > 1) {
          // Convert to mixed sequential/parallel workflow
          optimized.steps[i] = this.createMixedStep(parallelGroups);
        }
      }
    }

    return optimized;
  }

  /**
   * Find parallelizable task groups
   * @param tasks - Tasks
   * @returns Groups of tasks that can run in parallel
   */
  private findParallelizableGroups(tasks: WorkflowTask[]): WorkflowTask[][] {
    const groups: WorkflowTask[][] = [];
    const processed = new Set<string>();

    for (const task of tasks) {
      if (processed.has(task.skillId)) continue;

      const group = [task];
      processed.add(task.skillId);

      // Find tasks with no dependencies on this task
      for (const otherTask of tasks) {
        if (processed.has(otherTask.skillId)) continue;

        const hasNoDependency =
          !otherTask.dependsOn?.includes(task.skillId) &&
          !task.dependsOn?.includes(otherTask.skillId);

        if (hasNoDependency) {
          group.push(otherTask);
          processed.add(otherTask.skillId);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Create mixed sequential/parallel step
   * @param groups - Task groups
   * @returns Mixed step
   */
  private createMixedStep(groups: WorkflowTask[][]): WorkflowStep {
    // For now, convert to sequential with nested parallel
    return {
      type: WorkflowPattern.SEQUENTIAL,
      tasks: groups.flat()
    };
  }

  /**
   * Check if skills have strict dependencies
   * @param skills - Skills
   * @returns True if strict dependencies exist
   */
  private hasStrictDependencies(skills: Skill[]): boolean {
    for (const skill of skills) {
      const recommendedIds = skill.dependencies?.recommended || [];
      const hasRecommendedDependency = skills.some(s =>
        recommendedIds.includes(s.id)
      );

      if (hasRecommendedDependency) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if skills are independent
   * @param skills - Skills
   * @returns True if all skills are independent
   */
  private areIndependent(skills: Skill[]): boolean {
    for (const skill of skills) {
      const canParallelize = skill.orchestration?.parallelizable !== false;
      if (!canParallelize) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if one skill coordinates others
   * @param skills - Skills
   * @returns True if coordinator exists
   */
  private hasCoordinator(skills: Skill[]): boolean {
    if (skills.length < 2) return false;

    const priorities = skills.map(s => s.orchestration?.priority || 5);
    const maxPriority = Math.max(...priorities);
    const minPriority = Math.min(...priorities);

    // Significant priority difference suggests coordination
    return (maxPriority - minPriority) >= 3;
  }

  /**
   * Check if query needs iteration
   * @param query - Query
   * @returns True if iteration is needed
   */
  private needsIteration(query: string): boolean {
    const iterationKeywords = [
      'iterate', 'loop', 'repeat', 'until', 'while',
      'keep', 'continue', 'retry', 'recursive'
    ];

    const queryLower = query.toLowerCase();
    return iterationKeywords.some(keyword => queryLower.includes(keyword));
  }

  /**
   * Get data sharing targets for a skill
   * @param skill - Skill
   * @param allSkills - All skills in workflow
   * @returns Target skill IDs
   */
  private getDataSharingTargets(skill: Skill, allSkills: Skill[]): string[] {
    const targets: string[] = [];

    const canProvideDataTo = skill.collaboration?.canProvideDataTo || [];
    for (const targetId of canProvideDataTo) {
      if (allSkills.some(s => s.id === targetId)) {
        targets.push(targetId);
      }
    }

    return targets;
  }

  /**
   * Estimate workflow duration
   * @param skills - Skills
   * @param pattern - Pattern
   * @returns Estimated duration in ms
   */
  private estimateDuration(skills: Skill[], pattern: WorkflowPattern): number {
    const baseTime = 1000; // 1 second base
    const skillTimes = skills.map(s => s.orchestration?.estimatedTokens || 1000);

    switch (pattern) {
      case WorkflowPattern.SEQUENTIAL:
        return skillTimes.reduce((sum, time) => sum + time, baseTime);

      case WorkflowPattern.PARALLEL:
        return Math.max(...skillTimes) + baseTime;

      case WorkflowPattern.HIERARCHICAL:
        const parentTime = Math.max(...skillTimes);
        const childTime = Math.max(...skillTimes.slice(1));
        return parentTime + childTime + baseTime;

      case WorkflowPattern.ITERATIVE:
        return skillTimes[0] * 3 + baseTime; // Assume 3 iterations

      default:
        return skillTimes.reduce((sum, time) => sum + time, baseTime);
    }
  }

  /**
   * Generate unique workflow ID
   * @returns Workflow ID
   */
  private generateWorkflowId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
