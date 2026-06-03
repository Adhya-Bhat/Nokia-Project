// AI helper — OpenRouter API (free models available)
// Get your free key at: https://openrouter.ai/keys

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

export async function generateAISuggestion({ issueTitle, issueDescription, repositoryContext }) {
  const prompt = `You are SMAF AI — an intelligent IT support assistant for Nokia's Smart Masked Authorization Framework.
You help IT staff resolve technical issues by suggesting clear, actionable steps.
You have access to a knowledge base of previously resolved issues.

Always respond with exactly this format:
**Diagnosis:** (1-2 sentences explaining what the issue likely is)

**Resolution Steps:**
1. (first step)
2. (second step)
3. (continue as needed)

**Confidence Level:** High / Medium / Low

---

Issue Title: ${issueTitle}
Issue Description: ${issueDescription}

${repositoryContext ? `Similar resolved issues from knowledge base:\n${repositoryContext}` : 'No similar issues found in knowledge base — use general IT knowledge.'}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SMAF Nokia',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'OpenRouter API request failed')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'No response generated.'
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}

export function parseConfidenceScore(text) {
  const lower = text.toLowerCase()
  if (lower.includes('confidence level: high') || lower.includes('confidence:** high')) return 0.9
  if (lower.includes('confidence level: medium') || lower.includes('confidence:** medium')) return 0.6
  return 0.3
}
