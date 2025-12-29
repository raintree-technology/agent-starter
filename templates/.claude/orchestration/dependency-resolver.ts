/**
 * Dependency Resolver
 * Resolves skill dependencies and determines execution order
 */

import { Skill } from './types';

export class DependencyResolver {
  /**
   * Resolve dependencies and order skills
   * @param skills - Skills to order
   * @returns Ordered skills
   */
  resolveDependencies(skills: Skill[]): Skill[] {
    // Build dependency graph
    const graph = this.buildDependencyGraph(skills);

    // Perform topological sort
    const ordered = this.topologicalSort(graph, skills);

    return ordered;
  }

  /**
   * Build dependency graph
   * @param skills - Skills
   * @returns Dependency graph
   */
  private buildDependencyGraph(skills: Skill[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    // Initialize graph
    for (const skill of skills) {
      graph.set(skill.id, new Set());
    }

    // Add edges for dependencies
    for (const skill of skills) {
      const recommendedDeps = skill.dependencies?.recommended || [];

      for (const depId of recommendedDeps) {
        // Only add edge if dependency is in the skill set
        if (skills.some(s => s.id === depId)) {
          graph.get(skill.id)!.add(depId);
        }
      }
    }

    return graph;
  }

  /**
   * Topological sort using Kahn's algorithm
   * @param graph - Dependency graph
   * @param skills - Skills
   * @returns Sorted skills
   */
  private topologicalSort(
    graph: Map<string, Set<string>>,
    skills: Skill[]
  ): Skill[] {
    const skillMap = new Map(skills.map(s => [s.id, s]));
    const inDegree = new Map<string, number>();
    const result: Skill[] = [];

    // Calculate in-degrees
    for (const skillId of graph.keys()) {
      inDegree.set(skillId, 0);
    }

    for (const deps of graph.values()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Find skills with no dependencies
    const queue: string[] = [];
    for (const [skillId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(skillId);
      }
    }

    // Process queue
    while (queue.length > 0) {
      // Sort by priority (higher first)
      queue.sort((a, b) => {
        const priorityA = skillMap.get(a)?.orchestration?.priority || 5;
        const priorityB = skillMap.get(b)?.orchestration?.priority || 5;
        return priorityB - priorityA;
      });

      const skillId = queue.shift()!;
      const skill = skillMap.get(skillId)!;
      result.push(skill);

      // Reduce in-degree for dependents
      const deps = graph.get(skillId) || new Set();
      for (const dep of deps) {
        inDegree.set(dep, inDegree.get(dep)! - 1);

        if (inDegree.get(dep) === 0) {
          queue.push(dep);
        }
      }
    }

    // Check for cycles
    if (result.length !== skills.length) {
      console.warn('Circular dependency detected, using original order');
      return skills;
    }

    return result;
  }

  /**
   * Detect circular dependencies
   * @param skills - Skills
   * @returns True if circular dependencies exist
   */
  hasCircularDependencies(skills: Skill[]): boolean {
    const graph = this.buildDependencyGraph(skills);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const skillId of graph.keys()) {
      if (this.detectCycle(skillId, graph, visited, recursionStack)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect cycle using DFS
   * @param skillId - Current skill
   * @param graph - Dependency graph
   * @param visited - Visited set
   * @param recursionStack - Recursion stack
   * @returns True if cycle detected
   */
  private detectCycle(
    skillId: string,
    graph: Map<string, Set<string>>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(skillId);
    recursionStack.add(skillId);

    const deps = graph.get(skillId) || new Set();
    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (this.detectCycle(dep, graph, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }

    recursionStack.delete(skillId);
    return false;
  }

  /**
   * Get dependency chain for a skill
   * @param skillId - Skill ID
   * @param skills - All skills
   * @returns Dependency chain
   */
  getDependencyChain(skillId: string, skills: Skill[]): string[] {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) {
      return [];
    }

    const chain: string[] = [skillId];
    const visited = new Set<string>([skillId]);

    const queue = [...(skill.dependencies?.recommended || [])];

    while (queue.length > 0) {
      const depId = queue.shift()!;

      if (visited.has(depId)) {
        continue;
      }

      visited.add(depId);
      chain.push(depId);

      const depSkill = skills.find(s => s.id === depId);
      if (depSkill) {
        queue.push(...(depSkill.dependencies?.recommended || []));
      }
    }

    return chain;
  }
}
