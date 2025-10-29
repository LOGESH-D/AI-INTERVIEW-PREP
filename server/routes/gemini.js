const express = require('express');
const router = express.Router();

// Gemini API configuration (must be provided via environment)
function getGeminiApiKey(raw) {
  if (!raw) return raw;
  // If the env mistakenly contains the full REST URL, extract the key query param
  try {
    if (raw.includes('generativelanguage.googleapis.com')) {
      const url = new URL(raw);
      const key = url.searchParams.get('key');
      return key || raw;
    }
    // If it contains key=... as a plain string
    const keyIdx = raw.indexOf('key=');
    if (keyIdx !== -1) {
      return raw.substring(keyIdx + 4).trim();
    }
  } catch (_) {
    // fall through to return raw
  }
  return raw.trim();
}

const GEMINI_API_KEY = getGeminiApiKey(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GENERATIVE_LANGUAGE_MODEL || 'gemini-1.5-flash';
const GEMINI_API_VERSION = process.env.GENERATIVE_LANGUAGE_API_VERSION || 'v1beta';
const MOCK_GEMINI = String(process.env.MOCK_GEMINI || '').toLowerCase() === 'true';

// Use global endpoint (no regional prefix). Regional endpoints are not supported
function buildGeminiUrl(version = GEMINI_API_VERSION) {
  return `https://generativelanguage.googleapis.com/${version}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
}

async function callGeminiWithFallback(body, maxRetries = 3) {
  const versionsToTry = [GEMINI_API_VERSION, GEMINI_API_VERSION === 'v1beta' ? 'v1' : 'v1beta'];
  let lastErrorText = '';
  for (const version of versionsToTry) {
    const url = buildGeminiUrl(version);
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      console.log(`Calling Gemini at ${url} (attempt ${attempt}/${maxRetries})`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        return response;
      }
      const errorText = await response.text();
      lastErrorText = errorText;
      console.error(`Gemini error for ${version} (status ${response.status}):`, errorText);
      if (response.status === 429 && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited by Gemini. Waiting ${waitMs}ms before retry...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      if (response.status !== 404) {
        // For non-404 errors, don't try alternate version
        return new Response(errorText, { status: response.status });
      }
      // If 404, break and try next version
      break;
    }
  }
  return new Response(lastErrorText || 'Unknown error', { status: 404 });
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

function generateMockInterviewData(jobPosition, jobDesc, jobExperience) {
  const role = (jobPosition || 'Software Engineer').trim();
  const stack = (jobDesc || '').trim();
  const yrs = Number(jobExperience || 1);
  const xpBand = yrs <= 2 ? 'junior' : yrs <= 5 ? 'mid-level' : 'senior';

  const questions = [
    `Describe a ${xpBand} approach to building a ${role} feature using ${stack}.`,
    `How would you debug a production issue in a ${role} service using ${stack}?`,
    `Explain trade-offs between two designs you might use in ${stack} for ${role}.`,
    `Walk through how you would test and deploy a ${role} change safely.`,
    `How do you ensure performance and scalability for ${role} systems with ${stack}?`
  ];

  const ideals = [
    `Outline problem framing, constraints, iterative delivery, and cite ${stack} specifics with clear rationale.`,
    `Discuss observability (logs, metrics, traces), rollback plans, and root-cause analysis with ${stack} tools.`,
    `Compare complexity, reliability, and cost; justify selection with context relevant to ${role}.`,
    `Describe layered tests (unit, integration, e2e), CI gating, and progressive rollout strategies.`,
    `Address profiling, caching, data access patterns, and capacity planning aligned to expected load.`
  ];

  const skills = [
    role,
    ...stack.split(/[\,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 5),
    'Problem Solving',
    'System Design',
    'Testing',
    'Communication'
  ];

  return { questions, ideals, skills: Array.from(new Set(skills)) };
}

// Generate interview questions endpoint
router.post('/generate-questions', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    await waitForRateLimit(); // Wait before making request
    
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    console.log(`Making Gemini API call with prompt:`, prompt.substring(0, 100) + '...');
    console.log(`Using global endpoint, model: ${GEMINI_MODEL}, version: ${GEMINI_API_VERSION}`);

    let response;
    try {
      response = await callGeminiWithFallback(body);
    } catch (err) {
      if (MOCK_GEMINI || String(err.message).includes('RESOURCE_EXHAUSTED') || String(err.message).includes('429')) {
        const mock = generateMockInterviewData('Role', prompt || '', 2);
        return res.json({ success: true, result: mock.questions.join('\n'), mock: true });
      }
      throw err;
    }

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      if (MOCK_GEMINI || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('429')) {
        const mock = generateMockInterviewData('Role', prompt || '', 2);
        return res.json({ success: true, result: mock.questions.join('\n'), mock: true });
      }
      return res.status(response.status).json({
        success: false,
        error: `Gemini API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log('Gemini API result:', result);
    
    if (!result || result.trim().length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Empty response from Gemini API'
      });
    }
    
    res.json({ success: true, result });

  } catch (error) {
    console.error('Gemini API call failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate questions',
      details: error.message
    });
  }
});

// Generate interview data (questions + skills) endpoint
router.post('/generate-interview-data', async (req, res) => {
  try {
    const { jobPosition, jobDesc, jobExperience } = req.body;
    
    if (!jobPosition || !jobDesc || !jobExperience) {
      return res.status(400).json({ 
        success: false, 
        error: 'Job position, description, and experience are required' 
      });
    }

    const combinedPrompt = `Generate interview data for a candidate applying for the following job.
Create content that is tailored to the role, the described tech stack, and the experience level. Avoid generic questions.

Position: ${jobPosition}
Description: ${jobDesc}
Experience: ${jobExperience} years

Please provide:
1. Exactly 5 interview questions (no introduction, no explanations, no numbering, each on a new line). Ensure a mix across fundamentals, practical problem-solving, system/architecture (if relevant), and role-specific scenarios.
2. For each question, an ideal answer (concise, strong example) appropriate to the experience level.
3. Top 5-10 relevant skills as a comma-separated list. Include both technical and soft skills if relevant.

Format your response as:
QUESTIONS:
[5 questions, each on a new line]

IDEAL_ANSWERS:
[5 ideal answers, each on a new line corresponding to the questions]

SKILLS:
[comma-separated list of skills]`;

    await waitForRateLimit(); // Wait before making request
    
    const body = {
      contents: [
        {
          parts: [
            {
              text: combinedPrompt
            }
          ]
        }
      ]
    };

    console.log(`Making Gemini API call for interview data generation`);
    console.log(`Using global endpoint, model: ${GEMINI_MODEL}, version: ${GEMINI_API_VERSION}`);

    let response;
    try {
      response = await callGeminiWithFallback(body);
    } catch (err) {
      if (MOCK_GEMINI || String(err.message).includes('RESOURCE_EXHAUSTED') || String(err.message).includes('429')) {
        const mock = generateMockInterviewData(jobPosition, jobDesc, jobExperience);
        return res.json({ success: true, ...mock, mock: true });
      }
      throw err;
    }

    console.log('Gemini API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      if (MOCK_GEMINI || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('429')) {
        const mock = generateMockInterviewData(jobPosition, jobDesc, jobExperience);
        return res.json({ success: true, ...mock, mock: true });
      }
      return res.status(response.status).json({ success: false, error: 'Gemini API error', details: errorText });
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log('Gemini API result:', result);
    
    if (!result || result.trim().length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Empty response from Gemini API'
      });
    }
    
    // Parse the combined response including ideal answers (robust to casing and bullets)
    const lower = result.toLowerCase();
    const idxQ = lower.indexOf('questions:');
    const idxI = lower.indexOf('ideal_answers:');
    const idxS = lower.indexOf('skills:');

    const take = (start, end) => (start >= 0 ? result.substring(start, end >= 0 ? end : undefined) : '');

    const questionsRaw = take(idxQ >= 0 ? idxQ + 'questions:'.length : -1, idxI);
    const idealsRaw = take(idxI >= 0 ? idxI + 'ideal_answers:'.length : -1, idxS);
    const skillsRaw = take(idxS >= 0 ? idxS + 'skills:'.length : -1, -1);

    const stripBullet = (s) => s
      .replace(/^[-*]\s+/, '')
      .replace(/^[0-9]+[.)]?\s+/, '')
      .trim();

    const splitLines = (s) => s
      .split(/\r?\n/)
      .map(v => v.trim())
      .filter(Boolean)
      .map(stripBullet);

    let questions = splitLines(questionsRaw);
    let ideals = splitLines(idealsRaw);
    let skills = skillsRaw
      .replace(/\n/g, ' ')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    // Fallback: if questions came as a markdown list without labels
    if (questions.length === 0 && idxQ === -1 && idxI === -1) {
      questions = splitLines(result);
    }

    // Align lengths
    const minLen = Math.min(questions.length, ideals.length || questions.length);
    questions = questions.slice(0, minLen);
    ideals = ideals.slice(0, minLen);

    return res.json({ success: true, questions, ideals, skills });

  } catch (error) {
    console.error('Gemini API call failed:', error);
    if (MOCK_GEMINI || String(error.message).includes('RESOURCE_EXHAUSTED') || String(error.message).includes('429')) {
      const { jobPosition, jobDesc, jobExperience } = req.body || {};
      const mock = generateMockInterviewData(jobPosition, jobDesc, jobExperience);
      return res.json({ success: true, ...mock, mock: true });
    }
    return res.status(502).json({ success: false, error: 'Failed to generate interview data', details: error.message });
  }
});

// Test endpoint
// Lightweight throttled test endpoint that does NOT call Gemini
let lastTestTime = 0;
router.get('/test', async (req, res) => {
  const now = Date.now();
  const cooldownMs = 10000; // 10 seconds
  if (now - lastTestTime < cooldownMs) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, try again later',
      retryAfterMs: cooldownMs - (now - lastTestTime)
    });
  }
  lastTestTime = now;
  return res.json({
    success: true,
    result: 'API is working',
    message: 'Gemini route reachable (no upstream call)'
  });
});

module.exports = router;
