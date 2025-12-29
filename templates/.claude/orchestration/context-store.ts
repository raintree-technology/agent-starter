/**
 * Context Store
 * Shared state management for skill collaboration
 */

export class ContextStore {
  private globalContext: Map<string, any>;
  private skillContexts: Map<string, Map<string, any>>;

  constructor() {
    this.globalContext = new Map();
    this.skillContexts = new Map();
  }

  /**
   * Set value in context
   * @param key - Context key
   * @param value - Value
   * @param scope - Scope ('global' or skill ID)
   */
  set(key: string, value: any, scope: 'global' | string): void {
    if (scope === 'global') {
      this.globalContext.set(key, value);
    } else {
      if (!this.skillContexts.has(scope)) {
        this.skillContexts.set(scope, new Map());
      }

      this.skillContexts.get(scope)!.set(key, value);
    }
  }

  /**
   * Get value from context
   * @param key - Context key
   * @param scope - Scope (optional, searches global if not found in skill scope)
   * @returns Value or undefined
   */
  get(key: string, scope?: string): any {
    // Try skill-specific context first
    if (scope && scope !== 'global') {
      const skillContext = this.skillContexts.get(scope);
      if (skillContext?.has(key)) {
        return skillContext.get(key);
      }
    }

    // Fall back to global context
    return this.globalContext.get(key);
  }

  /**
   * Check if key exists
   * @param key - Context key
   * @param scope - Scope
   * @returns True if key exists
   */
  has(key: string, scope?: string): boolean {
    if (scope && scope !== 'global') {
      const skillContext = this.skillContexts.get(scope);
      if (skillContext?.has(key)) {
        return true;
      }
    }

    return this.globalContext.has(key);
  }

  /**
   * Delete value from context
   * @param key - Context key
   * @param scope - Scope
   */
  delete(key: string, scope?: string): void {
    if (scope === 'global') {
      this.globalContext.delete(key);
    } else if (scope) {
      this.skillContexts.get(scope)?.delete(key);
    } else {
      // Delete from all scopes
      this.globalContext.delete(key);
      this.skillContexts.forEach(ctx => ctx.delete(key));
    }
  }

  /**
   * Share data with specific skills
   * @param data - Data to share
   * @param targetSkills - Target skill IDs
   */
  share(data: Record<string, any>, targetSkills: string[]): void {
    for (const skillId of targetSkills) {
      if (!this.skillContexts.has(skillId)) {
        this.skillContexts.set(skillId, new Map());
      }

      const skillContext = this.skillContexts.get(skillId)!;
      for (const [key, value] of Object.entries(data)) {
        skillContext.set(`shared.${key}`, value);
      }
    }
  }

  /**
   * Get all shared data for a skill
   * @param skillId - Skill ID
   * @returns Shared data
   */
  getShared(skillId: string): Record<string, any> {
    const skillContext = this.skillContexts.get(skillId);
    if (!skillContext) {
      return {};
    }

    const shared: Record<string, any> = {};
    for (const [key, value] of skillContext.entries()) {
      if (key.startsWith('shared.')) {
        shared[key.replace('shared.', '')] = value;
      }
    }

    return shared;
  }

  /**
   * Get all context for a skill
   * @param skillId - Skill ID
   * @returns Skill context
   */
  getAll(skillId?: string): Record<string, any> {
    if (!skillId || skillId === 'global') {
      return Object.fromEntries(this.globalContext.entries());
    }

    const skillContext = this.skillContexts.get(skillId);
    if (!skillContext) {
      return {};
    }

    return Object.fromEntries(skillContext.entries());
  }

  /**
   * Clear context
   * @param scope - Scope to clear (optional, clears all if not specified)
   */
  clear(scope?: string): void {
    if (!scope) {
      this.globalContext.clear();
      this.skillContexts.clear();
    } else if (scope === 'global') {
      this.globalContext.clear();
    } else {
      this.skillContexts.delete(scope);
    }
  }

  /**
   * Get context size
   * @returns Size information
   */
  getSize(): { global: number; skills: number; total: number } {
    const globalSize = this.globalContext.size;
    const skillsSize = Array.from(this.skillContexts.values())
      .reduce((sum, ctx) => sum + ctx.size, 0);

    return {
      global: globalSize,
      skills: skillsSize,
      total: globalSize + skillsSize
    };
  }

  /**
   * Export context state
   * @returns Serializable context state
   */
  export(): any {
    return {
      global: Object.fromEntries(this.globalContext.entries()),
      skills: Object.fromEntries(
        Array.from(this.skillContexts.entries()).map(([skillId, ctx]) => [
          skillId,
          Object.fromEntries(ctx.entries())
        ])
      )
    };
  }

  /**
   * Import context state
   * @param state - Context state to import
   */
  import(state: any): void {
    if (state.global) {
      this.globalContext = new Map(Object.entries(state.global));
    }

    if (state.skills) {
      this.skillContexts = new Map(
        Object.entries(state.skills).map(([skillId, ctx]: [string, any]) => [
          skillId,
          new Map(Object.entries(ctx))
        ])
      );
    }
  }
}
