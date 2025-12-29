/**
 * Semantic Matcher
 * Embedding-based skill matching using cosine similarity
 */

import { Skill, EmbeddingCache, OrchestratorConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class SemanticMatcher {
  private cache: Map<string, number[]>;
  private cacheFile: string;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.cache = new Map();
    this.cacheFile = path.join(__dirname, 'embeddings', 'cache.json');
    this.loadCache();
  }

  /**
   * Calculate semantic match score between query and skill
   * @param query - User query
   * @param skill - Skill to match
   * @returns Match score (0-1)
   */
  async calculateMatch(query: string, skill: Skill): Promise<number> {
    if (!this.config.enableSemanticMatching) {
      return this.fallbackMatch(query, skill);
    }

    try {
      // Get embeddings
      const queryEmbedding = await this.getEmbedding(query);
      const skillEmbedding = await this.getSkillEmbedding(skill);

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding, skillEmbedding);

      return similarity;
    } catch (error) {
      console.error(`Semantic matching error: ${error.message}`);
      return this.fallbackMatch(query, skill);
    }
  }

  /**
   * Get embedding for text
   * @param text - Text to embed
   * @returns Embedding vector
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = `query:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Generate embedding
    const embedding = await this.generateEmbedding(text);

    // Cache if enabled
    if (this.config.cacheEmbeddings) {
      this.cache.set(cacheKey, embedding);
    }

    return embedding;
  }

  /**
   * Get cached embedding for skill
   * @param skill - Skill
   * @returns Embedding vector
   */
  private async getSkillEmbedding(skill: Skill): Promise<number[]> {
    const cacheKey = `skill:${skill.id}:${skill.version}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Generate embedding from skill metadata
    const skillText = this.skillToText(skill);
    const embedding = await this.generateEmbedding(skillText);

    // Cache
    this.cache.set(cacheKey, embedding);
    this.saveCache();

    return embedding;
  }

  /**
   * Generate embedding using configured provider
   * @param text - Text to embed
   * @returns Embedding vector
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const provider = this.config.embeddingProvider || 'openai';

    switch (provider) {
      case 'openai':
        return this.generateOpenAIEmbedding(text);
      case 'anthropic':
        return this.generateAnthropicEmbedding(text);
      case 'local':
        return this.generateLocalEmbedding(text);
      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }

  /**
   * Generate OpenAI embedding
   * @param text - Text
   * @returns Embedding
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    // Placeholder - would use actual OpenAI SDK
    // For now, return mock embedding
    return this.mockEmbedding(text);
  }

  /**
   * Generate Anthropic embedding
   * @param text - Text
   * @returns Embedding
   */
  private async generateAnthropicEmbedding(text: string): Promise<number[]> {
    // Placeholder - would use actual Anthropic SDK
    return this.mockEmbedding(text);
  }

  /**
   * Generate local embedding
   * @param text - Text
   * @returns Embedding
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // Placeholder - would use local model
    return this.mockEmbedding(text);
  }

  /**
   * Mock embedding for testing
   * @param text - Text
   * @returns Mock embedding
   */
  private mockEmbedding(text: string): number[] {
    // Simple hash-based mock embedding
    const dim = 384; // Common embedding dimension
    const embedding = new Array(dim).fill(0);

    for (let i = 0; i < text.length; i++) {
      const idx = text.charCodeAt(i) % dim;
      embedding[idx] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Convert skill to text for embedding
   * @param skill - Skill
   * @returns Text representation
   */
  private skillToText(skill: Skill): string {
    const parts: string[] = [
      skill.id,
      skill.category,
      ...skill.keywords
    ];

    if (skill.semanticTags) {
      parts.push(...skill.semanticTags.primary);
      parts.push(...skill.semanticTags.secondary);
      parts.push(...skill.semanticTags.domains);
    }

    if (skill.capabilities) {
      parts.push(...skill.capabilities.actions);
    }

    return parts.join(' ');
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param a - Vector A
   * @param b - Vector B
   * @returns Similarity score (0-1)
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Fallback matching without embeddings
   * @param query - Query
   * @param skill - Skill
   * @returns Match score
   */
  private fallbackMatch(query: string, skill: Skill): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Check keywords
    for (const keyword of skill.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }

    // Check ID
    if (queryLower.includes(skill.id.toLowerCase())) {
      score += 0.3;
    }

    // Check category
    if (queryLower.includes(skill.category.toLowerCase())) {
      score += 0.15;
    }

    // Check semantic tags
    if (skill.semanticTags) {
      for (const tag of skill.semanticTags.primary) {
        if (queryLower.includes(tag.toLowerCase().replace(/_/g, ' '))) {
          score += 0.25;
        }
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Load embedding cache from disk
   */
  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn(`Failed to load embedding cache: ${error.message}`);
    }
  }

  /**
   * Save embedding cache to disk
   */
  private saveCache(): void {
    try {
      const dir = path.dirname(this.cacheFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = Object.fromEntries(this.cache.entries());
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn(`Failed to save embedding cache: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache stats
   */
  getCacheStats(): any {
    return {
      totalEntries: this.cache.size,
      skillEmbeddings: Array.from(this.cache.keys()).filter(k => k.startsWith('skill:')).length,
      queryEmbeddings: Array.from(this.cache.keys()).filter(k => k.startsWith('query:')).length
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }
    } catch (error) {
      console.warn(`Failed to clear cache file: ${error.message}`);
    }
  }
}
