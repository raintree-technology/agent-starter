# Explain Skill Ranking

Explain why specific skills were selected and ranked for a given query.

## Purpose

This debugging tool provides transparency into the orchestration engine's decision-making:
- Why certain skills were selected (or not selected)
- How the ranking algorithm scored each skill
- What factors contributed most to the final ranking
- How to improve skill selection for your use case

## Allowed Tools

- Read(templates/.claude/skills/*/skill.json)
- Read(templates/.claude/orchestration/*.ts)
- Bash(node)

## Model Preference

haiku

## Instructions

When this command is invoked with a query (e.g., `/explain-ranking "build payment system"`):

### 1. Parse the Query

Extract:
- **Primary intent**: What the user wants (build, analyze, fix, etc.)
- **Domain keywords**: Technical terms (payment, database, mobile, etc.)
- **Context clues**: Implicit requirements (e.g., "mobile" implies UI needed)

Example:
```
Query: "build payment system with recurring subscriptions"

Parsed:
- Intent: build (weight: high for implementation skills)
- Keywords: payment, recurring, subscription
- Domains: fintech, saas
- Implicit: database needed (store subscriptions), webhooks (process events)
```

### 2. Simulate Orchestration

Run the ranking algorithm step-by-step for transparency:

#### A. Semantic Matching (35% weight)
```
stripe:
  Query embedding: [0.23, -0.45, 0.67, ...]
  Skill embedding: [0.21, -0.42, 0.71, ...]
  Cosine similarity: 0.94
  Score: 0.94 * 0.35 = 0.329

supabase:
  Cosine similarity: 0.78
  Score: 0.78 * 0.35 = 0.273
```

#### B. Keyword Matching (25% weight)
```
stripe:
  Matched tags: payment_processing (exact), subscription_billing (exact)
  Match rate: 2/2 primary tags = 1.0
  Score: 1.0 * 0.25 = 0.250

supabase:
  Matched tags: database (implied)
  Match rate: 0/2 primary, 1/3 secondary = 0.17
  Score: 0.17 * 0.25 = 0.043
```

#### C. Context Relevance (20% weight)
```
stripe:
  Query mentions: subscriptions, payment
  Skill capabilities: create_subscription, process_payment
  Relevance: 0.95
  Score: 0.95 * 0.20 = 0.190

supabase:
  Query implications: need to store subscription data
  Skill capabilities: database_operations, realtime
  Relevance: 0.70
  Score: 0.70 * 0.20 = 0.140
```

#### D. User History (10% weight)
```
stripe:
  Past queries: 3 payment-related queries in last 7 days
  Success rate: 100%
  Score: 1.0 * 0.10 = 0.100

supabase:
  Past queries: 5 database queries in last 7 days
  Success rate: 100%
  Score: 1.0 * 0.10 = 0.100
```

#### E. Skill Priority (10% weight)
```
stripe:
  Priority: 8/10
  Normalized: 0.80
  Score: 0.80 * 0.10 = 0.080

supabase:
  Priority: 9/10
  Normalized: 0.90
  Score: 0.90 * 0.10 = 0.090
```

### 3. Calculate Final Scores

Sum all components:
```
stripe:
  Semantic:    0.329 (35%)
  Keyword:     0.250 (25%)
  Context:     0.190 (20%)
  History:     0.100 (10%)
  Priority:    0.080 (10%)
  ─────────────────────────
  TOTAL:       0.949 ⭐ RANK #1

supabase:
  Semantic:    0.273 (35%)
  Keyword:     0.043 (25%)
  Context:     0.140 (20%)
  History:     0.100 (10%)
  Priority:    0.090 (10%)
  ─────────────────────────
  TOTAL:       0.646 ⭐ RANK #2

expo:
  TOTAL:       0.234 ⭐ RANK #7 (not selected - threshold: 0.5)
```

### 4. Explain Selection Decisions

#### Selected Skills (above threshold)
```
✅ SELECTED: stripe (0.949)
   Why: Perfect semantic match for "payment" and "subscription"
   Contributing factors:
   - Exact keyword matches: payment_processing, subscription_billing
   - High context relevance: handles recurring payments
   - Proven success: 100% success rate in past queries

✅ SELECTED: supabase (0.646)
   Why: Needed to store subscription and customer data
   Contributing factors:
   - Implied requirement: subscriptions need persistent storage
   - Collaboration: stripe provides data to supabase
   - High priority: 9/10 general-purpose skill
```

#### Rejected Skills (below threshold)
```
❌ REJECTED: expo (0.234 < 0.5 threshold)
   Why: Mobile framework not relevant for backend payment system
   Low scores:
   - Semantic: 0.067 (no match for "payment" or "subscription")
   - Keyword: 0.000 (mobile, react-native don't match)
   - Context: 0.050 (UI not mentioned in query)

   Would activate if query mentioned: "mobile app", "React Native", "iOS/Android"
```

### 5. Provide Recommendations

#### For This Query
```
Recommendations:
1. Add "webhooks" to query → Would activate webhook handling capabilities
2. Mention "database" explicitly → Would boost supabase score
3. Consider plaid skill → Bank account verification for subscriptions
```

#### For Skill Improvement
```
Suggested Enhancements:
1. stripe skill: Add more secondary tags (e.g., "revenue", "billing")
2. Create "subscription" skill → Dedicated subscription management
3. Enhance collaboration metadata → Link stripe + supabase + webhooks
```

### 6. Command-Line Options

Support options:
- `--query "text"` - Query to analyze (required)
- `--threshold <0.0-1.0>` - Selection threshold (default: 0.5)
- `--top <n>` - Show top N skills (default: 10)
- `--verbose` - Show all calculation details
- `--skills <id,id,...>` - Explain specific skills only
- `--suggest` - Show recommendations for improving ranking

### 7. Output Format

```markdown
# Skill Ranking Explanation

## Query Analysis
**Input:** "build payment system with recurring subscriptions"

**Parsed Intent:**
- Action: build
- Domain: fintech, saas
- Keywords: payment, recurring, subscription
- Implied needs: database, webhooks

---

## Ranking Results

### Selected Skills (2)

#### 1. stripe (0.949) ⭐⭐⭐⭐⭐
**Why selected:** Perfect match for payment processing and subscriptions

**Score Breakdown:**
| Factor          | Score | Weight | Contribution | Notes                           |
|-----------------|-------|--------|--------------|--------------------------------|
| Semantic Match  | 0.94  | 35%    | 0.329        | Near-perfect embedding match   |
| Keyword Match   | 1.00  | 25%    | 0.250        | Exact: payment, subscription   |
| Context         | 0.95  | 20%    | 0.190        | Handles recurring billing      |
| User History    | 1.00  | 10%    | 0.100        | 100% success, 3 recent uses    |
| Skill Priority  | 0.80  | 10%    | 0.080        | High-priority skill (8/10)     |

**Key Matches:**
- Primary tags: payment_processing ✓, subscription_billing ✓
- Capabilities: create_subscription ✓, process_payment ✓
- Actions: charge_customer, manage_subscription

---

#### 2. supabase (0.646) ⭐⭐⭐
**Why selected:** Database needed for subscription storage

**Score Breakdown:**
| Factor          | Score | Weight | Contribution | Notes                           |
|-----------------|-------|--------|--------------|--------------------------------|
| Semantic Match  | 0.78  | 35%    | 0.273        | Moderate match (backend focus) |
| Keyword Match   | 0.17  | 25%    | 0.043        | Implied: database needed       |
| Context         | 0.70  | 20%    | 0.140        | Store customer/subscription    |
| User History    | 1.00  | 10%    | 0.100        | 100% success, 5 recent uses    |
| Skill Priority  | 0.90  | 10%    | 0.090        | Top-priority skill (9/10)      |

**Collaboration:**
- Receives data from: stripe (payment events, customer data)
- Shared context: user_id, subscription_id

---

### Not Selected (8)

#### expo (0.234) ❌
**Why rejected:** Mobile framework not needed for backend system

**Would activate if query mentioned:**
- "mobile app" or "iOS/Android"
- "React Native"
- "client app" or "user interface"

---

## Recommendations

### Improve This Query
1. Add "webhooks" → Activate webhook handling
2. Mention "customer portal" → Activate frontend skills
3. Add "bank accounts" → Consider plaid skill

### Improve Skills
1. **stripe:** Add secondary tags: revenue, billing, invoice
2. **Create new skill:** Dedicated subscription-management skill
3. **supabase:** Add "billing" to semantic tags

### Adjust Threshold
Current: 0.5 (balanced)
- Lower to 0.3 → Include expo (0.234) - good for exploratory queries
- Raise to 0.7 → Only stripe (0.949) - good for focused queries

---

## Debug Info

**Orchestration Config:**
- Semantic matching: enabled
- Embedding provider: openai
- Cache hit rate: 95%
- Selection threshold: 0.5
- Max active skills: 5

**Performance:**
- Total skills evaluated: 40
- Ranking time: 234ms
- Embeddings: 2 API calls (38 cached)
```

### 8. Examples

```bash
# Explain ranking for query
/explain-ranking --query "build payment system"

# Show only top 5 skills
/explain-ranking --query "mobile app with auth" --top 5

# Verbose mode (show all calculations)
/explain-ranking --query "e-commerce store" --verbose

# Explain specific skills
/explain-ranking --query "api integration" --skills stripe,plaid,supabase

# Get recommendations
/explain-ranking --query "real-time chat" --suggest
```

## Error Handling

- If orchestration not enabled in settings.json, show error with instructions
- If no skills have orchestration metadata, explain limitation
- If query is empty, show usage examples
- If semantic matching fails (API error), fall back to keyword-only explanation

## Notes

- Make calculations transparent and easy to understand
- Focus on actionable insights (how to improve selection)
- Show both successes (why skills ranked high) and failures (why skills rejected)
- Provide specific, concrete recommendations
