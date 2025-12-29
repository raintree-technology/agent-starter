/**
 * Skill Ranker
 * Multi-factor scoring algorithm for skill selection
 */

import { Skill, SkillScore, RankingWeights, UserContext, OrchestratorConfig } from './types';

export class SkillRanker {
  private weights: RankingWeights;
  private userContext: UserContext;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;

    // Default weights (must sum to 1.0)
    this.weights = {
      semanticMatch: 0.35,    // 35% - Embedding similarity
      keywordMatch: 0.25,     // 25% - Keyword overlap
      contextRelevance: 0.20, // 20% - Current context
      userHistory: 0.10,      // 10% - Past usage
      skillPriority: 0.10     // 10% - Skill priority
    };

    // Initialize user context
    this.userContext = {
      recentSkills: [],
      preferredSkills: [],
      skillSuccessRates: {},
      commonCombinations: []
    };
  }

  /**
   * Rank skills by relevance
   * @param query - User query
   * @param skills - Skills to rank
   * @param semanticScores - Optional pre-calculated semantic scores
   * @returns Ranked skills with scores
   */
  async rankSkills(
    query: string,
    skills: Skill[],
    semanticScores?: Map<string, number>
  ): Promise<SkillScore[]> {
    const scores: SkillScore[] = [];

    for (const skill of skills) {
      const breakdown = {
        semanticMatch: semanticScores?.get(skill.id) || 0,
        keywordMatch: this.calculateKeywordMatch(query, skill),
        contextRelevance: this.calculateContextRelevance(skill),
        userHistory: this.calculateUserHistoryScore(skill),
        skillPriority: this.normalizeSkillPriority(skill)
      };

      const totalScore =
        breakdown.semanticMatch * this.weights.semanticMatch +
        breakdown.keywordMatch * this.weights.keywordMatch +
        breakdown.contextRelevance * this.weights.contextRelevance +
        breakdown.userHistory * this.weights.userHistory +
        breakdown.skillPriority * this.weights.skillPriority;

      scores.push({
        skill,
        totalScore,
        breakdown
      });
    }

    // Sort by total score (descending)
    scores.sort((a, b) => b.totalScore - a.totalScore);

    return scores;
  }

  /**
   * Calculate keyword match score
   * @param query - Query
   * @param skill - Skill
   * @returns Match score (0-1)
   */
  private calculateKeywordMatch(query: string, skill: Skill): number {
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    let matchScore = 0;
    let totalTokens = queryTokens.length;

    // Check skill ID
    if (queryTokens.some(token => skill.id.toLowerCase().includes(token))) {
      matchScore += 0.3;
    }

    // Check keywords
    let keywordMatches = 0;
    for (const keyword of skill.keywords) {
      if (queryTokens.some(token => keyword.toLowerCase().includes(token))) {
        keywordMatches++;
      }
    }
    matchScore += (keywordMatches / skill.keywords.length) * 0.4;

    // Check category
    if (queryTokens.some(token => skill.category.toLowerCase().includes(token))) {
      matchScore += 0.2;
    }

    // Check semantic tags
    if (skill.semanticTags) {
      const allTags = [
        ...skill.semanticTags.primary,
        ...skill.semanticTags.secondary
      ];

      let tagMatches = 0;
      for (const tag of allTags) {
        const tagWords = tag.toLowerCase().replace(/_/g, ' ').split(/\s+/);
        if (tagWords.some(word => queryTokens.includes(word))) {
          tagMatches++;
        }
      }

      if (allTags.length > 0) {
        matchScore += (tagMatches / allTags.length) * 0.1;
      }
    }

    return Math.min(matchScore, 1.0);
  }

  /**
   * Calculate context relevance score
   * @param skill - Skill
   * @returns Relevance score (0-1)
   */
  private calculateContextRelevance(skill: Skill): number {
    let score = 0;

    // Check if skill was recently used
    const recentUseBonus = this.userContext.recentSkills.includes(skill.id) ? 0.3 : 0;
    score += recentUseBonus;

    // Check if skill is commonly used with recently used skills
    const recentSkillsSet = new Set(this.userContext.recentSkills);
    const commonCombinationBonus = this.userContext.commonCombinations.some(combo =>
      combo.includes(skill.id) && combo.some(id => recentSkillsSet.has(id))
    ) ? 0.4 : 0;
    score += commonCombinationBonus;

    // Check skill dependencies and recommendations
    if (skill.dependencies) {
      const recommendedBonus = skill.dependencies.recommended.some(id =>
        recentSkillsSet.has(id)
      ) ? 0.2 : 0;
      score += recommendedBonus;

      const complementsBonus = skill.dependencies.complements.some(id =>
        recentSkillsSet.has(id)
      ) ? 0.1 : 0;
      score += complementsBonus;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate user history score
   * @param skill - Skill
   * @returns History score (0-1)
   */
  private calculateUserHistoryScore(skill: Skill): number {
    let score = 0;

    // Preferred skill bonus
    if (this.userContext.preferredSkills.includes(skill.id)) {
      score += 0.4;
    }

    // Success rate bonus
    const successRate = this.userContext.skillSuccessRates[skill.id];
    if (successRate !== undefined) {
      score += successRate * 0.6;
    } else {
      // Neutral score for new skills
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Normalize skill priority to 0-1 range
   * @param skill - Skill
   * @returns Normalized priority (0-1)
   */
  private normalizeSkillPriority(skill: Skill): number {
    const priority = skill.orchestration?.priority || 5;
    // Assuming priority range is 1-10
    return (priority - 1) / 9;
  }

  /**
   * Update user context with recent activity
   * @param skillId - Recently used skill
   * @param success - Whether skill usage was successful
   */
  updateUserContext(skillId: string, success: boolean): void {
    // Add to recent skills (keep last 10)
    this.userContext.recentSkills.unshift(skillId);
    this.userContext.recentSkills = this.userContext.recentSkills.slice(0, 10);

    // Update success rate
    const currentRate = this.userContext.skillSuccessRates[skillId] || 0.5;
    const currentCount = Math.max(1, this.userContext.recentSkills.filter(id => id === skillId).length);

    // Weighted average: give more weight to recent usage
    const newRate = (currentRate * (currentCount - 1) + (success ? 1 : 0)) / currentCount;
    this.userContext.skillSuccessRates[skillId] = newRate;
  }

  /**
   * Learn common skill combinations
   * @param skillIds - Skills used together
   */
  learnCombination(skillIds: string[]): void {
    if (skillIds.length < 2) return;

    // Check if combination already exists
    const exists = this.userContext.commonCombinations.some(combo =>
      combo.length === skillIds.length &&
      combo.every(id => skillIds.includes(id))
    );

    if (!exists) {
      this.userContext.commonCombinations.push([...skillIds]);

      // Keep only top 20 combinations
      if (this.userContext.commonCombinations.length > 20) {
        this.userContext.commonCombinations.shift();
      }
    }
  }

  /**
   * Set custom ranking weights
   * @param weights - Custom weights
   */
  setWeights(weights: Partial<RankingWeights>): void {
    this.weights = { ...this.weights, ...weights };

    // Normalize to ensure sum is 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      Object.keys(this.weights).forEach(key => {
        this.weights[key as keyof RankingWeights] /= sum;
      });
    }
  }

  /**
   * Get current ranking weights
   * @returns Current weights
   */
  getWeights(): RankingWeights {
    return { ...this.weights };
  }

  /**
   * Reset user context
   */
  resetUserContext(): void {
    this.userContext = {
      recentSkills: [],
      preferredSkills: [],
      skillSuccessRates: {},
      commonCombinations: []
    };
  }

  /**
   * Export user context
   * @returns User context
   */
  exportUserContext(): UserContext {
    return { ...this.userContext };
  }

  /**
   * Import user context
   * @param context - User context to import
   */
  importUserContext(context: UserContext): void {
    this.userContext = { ...context };
  }
}
