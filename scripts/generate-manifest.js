#!/usr/bin/env node

/**
 * Auto-generate manifest.json from templates/.claude/skills directory
 * Scans for all skill.md files and creates manifest entries
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILLS_DIR = join(__dirname, '../templates/.claude/skills');
const MANIFEST_PATH = join(__dirname, '../templates/.claude/manifest.json');

// Category mapping based on top-level directory
const CATEGORY_MAP = {
  'anthropic': 'ai',
  'aptos': 'blockchain',
  'expo': 'mobile',
  'ios': 'mobile',
  'plaid': 'banking',
  'stripe': 'payments',
  'whop': 'payments',
  'shopify': 'payments',
  'supabase': 'backend',
  'toon-formatter': 'utilities'
};

// Documentation URLs
const DOCS_URLS = {
  'anthropic': { url: 'https://docs.anthropic.com', files: 199, size: '3.4MB' },
  'claude-code': { url: 'https://code.claude.com/docs', files: 201, size: '3.0MB' },
  'stripe': { url: 'https://docs.stripe.com', files: 3253, size: '33MB' },
  'whop': { url: 'https://docs.whop.com', files: 212, size: '2.3MB' },
  'shopify': { url: 'https://shopify.dev/docs', files: 25, size: '280KB' },
  'supabase': { url: 'https://supabase.com/docs', files: 2616, size: '111MB' },
  'expo': { url: 'https://docs.expo.dev', files: 810, size: '11MB' },
  'plaid': { url: 'https://plaid.com/docs', files: 659, size: '15MB' }
};

function findSkillFiles(dir, basePath = '') {
  const skills = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    const relativePath = basePath ? join(basePath, entry) : entry;

    if (stat.isDirectory()) {
      // Check if this directory has a skill.md
      const skillMdPath = join(fullPath, 'skill.md');
      try {
        statSync(skillMdPath);
        // Found a skill!
        skills.push({
          path: relativePath,
          fullPath: skillMdPath
        });
      } catch {
        // No skill.md here, continue recursing
      }

      // Recurse into subdirectories
      skills.push(...findSkillFiles(fullPath, relativePath));
    }
  }

  return skills;
}

function extractSkillInfo(skillMdPath) {
  try {
    const content = readFileSync(skillMdPath, 'utf-8');

    // Extract name from first # heading
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1].trim() : null;

    // Extract description from first paragraph after heading
    const descMatch = content.match(/^#.+\n\n(.+)$/m);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract keywords from frontmatter if it exists
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
    let keywords = [];
    if (frontmatterMatch) {
      const keywordsMatch = frontmatterMatch[1].match(/keywords?:\s*\[([^\]]+)\]/);
      if (keywordsMatch) {
        keywords = keywordsMatch[1].split(',').map(k => k.trim().replace(/['"]/g, ''));
      }
    }

    return { name, description, keywords };
  } catch {
    return { name: null, description: '', keywords: [] };
  }
}

function pathToId(path) {
  return path.replace(/\//g, '-');
}

function getCategory(path) {
  const topLevel = path.split('/')[0];
  return CATEGORY_MAP[topLevel] || 'other';
}

function generateManifest() {
  console.log('🔍 Scanning for skills...');

  const skillFiles = findSkillFiles(SKILLS_DIR);
  console.log(`✓ Found ${skillFiles.length} skills\n`);

  const skills = skillFiles.map(({ path, fullPath }) => {
    const info = extractSkillInfo(fullPath);
    const id = pathToId(path);
    const category = getCategory(path);

    // Get docs info if available
    const topLevel = path.split('/')[0];
    const docsInfo = DOCS_URLS[id] || DOCS_URLS[topLevel];

    const skill = {
      id,
      name: info.name || path.split('/').pop(),
      category,
      path,
      description: info.description || `${info.name || path} skill`,
      keywords: info.keywords.length > 0 ? info.keywords : [path.split('/').pop()]
    };

    if (docsInfo) {
      skill.docs = {
        url: docsInfo.url,
        required: false,
        ...(docsInfo.files && { files: docsInfo.files }),
        ...(docsInfo.size && { size: docsInfo.size })
      };
    } else {
      skill.docs = { required: false };
    }

    console.log(`  ✓ ${path}`);
    return skill;
  });

  // Count by category
  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {});

  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalSkills: skills.length,
    categories: {
      ai: {
        name: 'AI & Claude Code',
        description: 'AI development and Claude Code skills',
        skillCount: categoryCounts.ai || 0
      },
      blockchain: {
        name: 'Blockchain & Web3',
        description: 'Aptos, Move language, and blockchain development',
        skillCount: categoryCounts.blockchain || 0
      },
      mobile: {
        name: 'Mobile Development',
        description: 'Expo, React Native, and iOS development',
        skillCount: categoryCounts.mobile || 0
      },
      payments: {
        name: 'Payments & Commerce',
        description: 'Payment processing and e-commerce platforms',
        skillCount: categoryCounts.payments || 0
      },
      banking: {
        name: 'Banking & Fintech',
        description: 'Banking APIs and financial data',
        skillCount: categoryCounts.banking || 0
      },
      backend: {
        name: 'Backend & Databases',
        description: 'Backend services and databases',
        skillCount: categoryCounts.backend || 0
      },
      utilities: {
        name: 'Developer Utilities',
        description: 'Tools and utilities',
        skillCount: categoryCounts.utilities || 0
      }
    },
    skills: skills.sort((a, b) => a.path.localeCompare(b.path))
  };

  console.log('\n📝 Writing manifest.json...');
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n✅ Generated manifest with ${skills.length} skills`);
  console.log('\nBreakdown by category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

generateManifest();
