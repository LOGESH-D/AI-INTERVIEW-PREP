const express = require('express');
const router = express.Router();

// Gemini API configuration (must be provided via environment)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GENERATIVE_LANGUAGE_MODEL || 'gemini-1.5-flash';
const GEMINI_API_VERSION = process.env.GENERATIVE_LANGUAGE_API_VERSION || 'v1beta';

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

    const response = await callGeminiWithFallback(body);

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      if (response.status === 429) {
        // Graceful fallback when rate limited
        const genericQuestions = [
          'Tell me about yourself and your experience relevant to this role.',
          'Describe a challenging project you worked on. What was your approach?',
          'How do you prioritize tasks when deadlines are tight?',
          'Explain a time you received critical feedback and how you handled it.',
          'Why are you interested in this position and our company?'
        ];
        const genericSkills = ['Communication','Problem Solving','Teamwork','Time Management','Adaptability'];
        return res.status(200).json({ success: true, questions: genericQuestions, skills: genericSkills, fallback: true });
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
    
    res.json({
      success: true,
      result: result
    });

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

    const response = await callGeminiWithFallback(body);

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      // Graceful fallback for rate limits or any upstream error
      const genericQuestions = [
        'Tell me about yourself and your experience relevant to this role.',
        'Describe a challenging project you worked on. What was your approach?',
        'How do you prioritize tasks when deadlines are tight?',
        'Explain a time you received critical feedback and how you handled it.',
        'Why are you interested in this position and our company?'
      ];
      const genericSkills = ['Communication','Problem Solving','Teamwork','Time Management','Adaptability'];
      return res.status(200).json({ success: true, questions: genericQuestions, skills: genericSkills, fallback: true });
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
    
    // Parse the combined response including ideal answers
    const sectionAfterQuestions = result.split('QUESTIONS:')[1] || '';
    const questionsSection = sectionAfterQuestions.split('IDEAL_ANSWERS:')[0] || '';
    const sectionAfterIdeals = sectionAfterQuestions.split('IDEAL_ANSWERS:')[1] || '';
    const idealSection = sectionAfterIdeals.split('SKILLS:')[0] || '';
    const skillsSection = (sectionAfterIdeals.includes('SKILLS:') ? sectionAfterIdeals.split('SKILLS:')[1] : result.split('SKILLS:')[1]) || '';

    const normalizeQuestion = (q) => q.replace(/^[0-9]+[.)]?\s*/, '').trim();

    const questions = questionsSection
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(normalizeQuestion);

    const ideals = idealSection
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const skills = skillsSection
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Ensure we have pairs of question/ideal of equal length
    const minLen = Math.min(questions.length, ideals.length);
    const qOut = questions.slice(0, minLen);
    const iOut = ideals.slice(0, minLen);

    return res.json({ success: true, questions: qOut, ideals: iOut, skills });

  } catch (error) {
    console.error('Gemini API call failed:', error);
    // Final safety net fallback to avoid empty/500 responses to client
    const genericQuestions = [
      'Tell me about yourself and your experience relevant to this role.',
      'Describe a challenging project you worked on. What was your approach?',
      'How do you prioritize tasks when deadlines are tight?',
      'Explain a time you received critical feedback and how you handled it.',
      'Why are you interested in this position and our company?'
    ];
    const genericSkills = ['Communication','Problem Solving','Teamwork','Time Management','Adaptability'];
    return res.status(200).json({ success: true, questions: genericQuestions, skills: genericSkills, fallback: true });
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
