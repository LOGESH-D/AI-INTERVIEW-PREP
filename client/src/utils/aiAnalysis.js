import { generateInterviewQuestions } from './gemini';

const AI_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=AI";

export { AI_AVATAR };

export async function getIdealAnswer(question) {
  // Use Gemini to generate an ideal answer for the question
  const prompt = `Provide a concise, high-quality answer for the following interview question:\n${question}`;
  return await generateInterviewQuestions(prompt);
}

// --- SEMANTIC SIMILARITY UTILS ---
/**
 * Get embedding for a text using Gemini API (or placeholder if not available)
 * Returns a vector (array of numbers)
 */
export async function getEmbedding(text) {
  // Placeholder: In production, use Gemini/Google Embeddings API or OpenAI Embeddings
  // Here, we simulate with a call to Gemini API (if it supports embeddings)
  // For now, fallback to a simple hash-based vector for demonstration
  // Replace this with real embedding API call
  const hash = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array(10).fill(0).map((_, i) => (hash % (i + 7)) / 10);
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

/**
 * Extract key points from an answer (simple: split into sentences, filter short ones)
 */
function extractKeyPoints(answer) {
  return answer
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 6);
}

/**
 * Find missing key points from ideal answer that are not in user answer
 */
function findMissingPoints(idealPoints, userAnswer) {
  return idealPoints.filter(point => !userAnswer.toLowerCase().includes(point.toLowerCase().slice(0, 8)));
}

export async function getMatchScore(question, ideal, user) {
  // --- SEMANTIC SIMILARITY & MISSING POINTS ---
  try {
    // Get embeddings
    const idealEmbedding = await getEmbedding(ideal);
    const userEmbedding = await getEmbedding(user);
    const similarity = cosineSimilarity(idealEmbedding, userEmbedding); // 0-1

    // Score: map similarity to 0-10 (linear, can be tuned)
    let score = Math.round(similarity * 10);
    if (score > 10) score = 10;
    if (score < 0) score = 0;

    // Extract key points from ideal answer
    const idealPoints = extractKeyPoints(ideal);
    // Find missing points
    const missingPoints = findMissingPoints(idealPoints, user);
    // Penalize score for missing points (each missing point -1, min 0)
    score = Math.max(0, score - missingPoints.length);

    return { score, missingPoints, similarity: Math.round(similarity * 100) / 100 };
  } catch (error) {
    console.error('Semantic similarity scoring error:', error);
    // Fallback to old logic
    if (!user || user.trim().length === 0) return { score: 0, missingPoints: [], similarity: 0 };
    const userText = user.trim().toLowerCase();
    const questionText = question.trim().toLowerCase();
    const questionWords = questionText.split(/\s+/).filter(word => word.length > 3);
    const userWords = userText.split(/\s+/).filter(word => word.length > 3);
    const commonWords = questionWords.filter(word => userWords.includes(word));
    const relevanceScore = commonWords.length > 0 ? Math.min(6, commonWords.length * 2) : 1;
    const lengthScore = userText.length > 50 ? 3 : userText.length > 20 ? 2 : 1;
    const fallbackScore = Math.min(7, relevanceScore + lengthScore);
    return { score: fallbackScore, missingPoints: [], similarity: 0 };
  }
}

export async function analyzeSkills(userAnswer, question, audioURL) {
  const prompt = `Analyze the following interview response and provide detailed scores out of 10 for each skill category.

Question: ${question}
User Answer: ${userAnswer}
${audioURL ? 'Note: Audio recording is available for analysis.' : ''}

Evaluation Criteria:
1. **Communication (0-10)**: 
   - Clarity and articulation
   - Confidence in speech delivery
   - Logical flow and structure
   - Ability to convey ideas effectively

2. **Grammar & Language (0-10)**:
   - Proper sentence structure
   - Vocabulary usage and variety
   - Language proficiency
   - Professional tone

3. **Professional Attitude (0-10)**:
   - Enthusiasm and engagement
   - Professional demeanor
   - Positive attitude
   - Willingness to learn

4. **Soft Skills (0-10)**:
   - Problem-solving approach
   - Adaptability and flexibility
   - Interpersonal skills
   - Critical thinking

Scoring Guidelines:
- 9-10: Exceptional performance in this area
- 7-8: Good performance with minor areas for improvement
- 5-6: Average performance, needs development
- 3-4: Below average, significant improvement needed
- 1-2: Poor performance, major development required
- 0: No demonstration of this skill

If the answer is completely irrelevant or shows no understanding of the question, score communication and soft skills very low (1-3).

Return only the four scores separated by commas in this exact format: communication_score,grammar_score,attitude_score,soft_skills_score`;

  try {
    const result = await generateInterviewQuestions(prompt);
    const scores = result.split(',').map(s => parseInt(s.trim().match(/\d+/)?.[0] || '5', 10));
    return {
      communication: Math.max(0, Math.min(10, scores[0] || 5)),
      grammar: Math.max(0, Math.min(10, scores[1] || 5)),
      attitude: Math.max(0, Math.min(10, scores[2] || 5)),
      softSkills: Math.max(0, Math.min(10, scores[3] || 5))
    };
  } catch (error) {
    console.error('Skill analysis error:', error);
    // Enhanced fallback skill analysis
    if (!userAnswer || userAnswer.trim().length === 0) {
      return {
        communication: 1,
        grammar: 1,
        attitude: 1,
        softSkills: 1,
        communicationDetails: {
          fillerWords: [],
          pace: null,
          pauses: null,
          suggestions: ['No answer provided.']
        }
      };
    }
    
    const text = userAnswer.trim().toLowerCase();
    // NLP-based filler word detection
    const fillerWordList = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'right', 'well'];
    const fillerWords = fillerWordList.filter(word => text.includes(word));
    // Sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;
    const sentenceVariety = new Set(sentences.map(s => s.split(' ')[0])).size;
    // Communication score
    let communication = Math.min(8, Math.max(2, sentences.length * 0.5 + (avgSentenceLength > 20 ? 2 : 1)));
    if (fillerWords.length > 2) communication -= 1;
    if (sentenceVariety < 2) communication -= 1;
    // Audio analysis (placeholder)
    let pace = null;
    let pauses = null;
    if (audioURL) {
      // Placeholder: In production, analyze audio for pace and pauses
      // For now, simulate with random values
      pace = Math.random() * (180 - 90) + 90; // words per minute
      pauses = Math.floor(Math.random() * 5); // number of long pauses
      if (pace < 110 || pace > 160) communication -= 1;
      if (pauses > 2) communication -= 1;
    }
    // Advanced soft skills and sentiment analysis
    // Soft skills cues
    const empathyCues = ['understand', 'empath', 'care', 'listen', 'support', 'help'];
    const leadershipCues = ['lead', 'manage', 'organize', 'initiative', 'guide', 'mentor'];
    const teamworkCues = ['team', 'collaborate', 'together', 'group', 'support', 'cooperate'];
    const adaptabilityCues = ['adapt', 'change', 'flexible', 'adjust', 'learn', 'new'];
    const problemSolvingCues = ['solve', 'problem', 'challenge', 'fix', 'improve', 'analyze'];
    const positivityCues = ['positive', 'enthusiastic', 'motivated', 'excited', 'optimistic', 'happy'];
    // Count cues
    function countCues(cues) { return cues.filter(word => text.includes(word)).length; }
    const softSkillsCues = {
      empathy: countCues(empathyCues),
      leadership: countCues(leadershipCues),
      teamwork: countCues(teamworkCues),
      adaptability: countCues(adaptabilityCues),
      problemSolving: countCues(problemSolvingCues),
      positivity: countCues(positivityCues)
    };
    // Sentiment analysis (simple)
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'helpful', 'improve', 'learn', 'understand', ...positivityCues];
    const negativeWords = ['bad', 'terrible', 'hate', 'difficult', 'problem', 'issue', 'wrong', 'fail', 'stress'];
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    let sentiment = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';
    // Emotion analysis (simulate if audioURL)
    let emotion = null;
    if (audioURL) {
      const emotions = ['calm', 'anxious', 'excited', 'confident', 'neutral'];
      emotion = emotions[Math.floor(Math.random() * emotions.length)];
    }
    // Soft skills suggestions
    const softSkillsSuggestions = [];
    if (softSkillsCues.empathy === 0) softSkillsSuggestions.push('Show more empathy in your responses.');
    if (softSkillsCues.leadership === 0) softSkillsSuggestions.push('Demonstrate leadership or initiative where possible.');
    if (softSkillsCues.teamwork === 0) softSkillsSuggestions.push('Highlight teamwork or collaboration experience.');
    if (softSkillsCues.adaptability === 0) softSkillsSuggestions.push('Mention adaptability or learning from change.');
    if (softSkillsCues.problemSolving === 0) softSkillsSuggestions.push('Describe your problem-solving approach.');
    if (sentiment === 'negative') softSkillsSuggestions.push('Try to maintain a positive tone in your answers.');
    if (emotion === 'anxious') softSkillsSuggestions.push('Try to stay calm and confident during your response.');
    if (emotion === 'excited') softSkillsSuggestions.push('Great energy! Just ensure clarity and focus.');
    // Suggestions
    const suggestions = [];
    if (fillerWords.length > 2) suggestions.push('Reduce filler words for clearer speech.');
    if (sentenceVariety < 2) suggestions.push('Vary your sentence openings for more engaging delivery.');
    if (pace && (pace < 110 || pace > 160)) suggestions.push('Adjust your speaking pace to a natural range (110-160 wpm).');
    if (pauses && pauses > 2) suggestions.push('Try to avoid long pauses in your speech.');
    if (communication >= 7) suggestions.push('Excellent clarity and articulation!');
    
    return {
      communication: Math.round(communication),
      grammar: Math.round(grammar),
      attitude: Math.round(attitude),
      softSkills: Math.round(softSkills),
      communicationDetails: {
        fillerWords,
        pace,
        pauses,
        suggestions
      },
      softSkillsDetails: {
        cues: softSkillsCues,
        sentiment,
        emotion,
        suggestions: softSkillsSuggestions
      }
    };
  }
}

/**
 * Simulate body language/facial expression analysis from video
 * In production, replace with real computer vision API call
 */
export async function analyzeBodyLanguage(videoURL) {
  // Simulate with random values for now
  const expressions = ['confident', 'nervous', 'smiling', 'distracted', 'neutral'];
  const expression = expressions[Math.floor(Math.random() * expressions.length)];
  const eyeContact = Math.random() > 0.3;
  const suggestions = [];
  if (!eyeContact) suggestions.push('Maintain eye contact with the camera for a more confident impression.');
  if (expression === 'nervous') suggestions.push('Try to relax and avoid fidgeting.');
  if (expression === 'distracted') suggestions.push('Focus on the interviewer and avoid looking away frequently.');
  if (expression === 'smiling') suggestions.push('Great job smiling! It helps you appear confident and approachable.');
  if (expression === 'confident') suggestions.push('Excellent confident body language!');
  return { expression, eyeContact, suggestions };
}

export async function checkAnswerRelevance(question, userAnswer) {
  const prompt = `Determine if the user's answer is relevant to the interview question.

Question: ${question}
User Answer: ${userAnswer}

Evaluate the relevance on a scale of 0-10:
- 9-10: Highly relevant and directly addresses the question
- 7-8: Mostly relevant with minor tangents
- 5-6: Somewhat relevant but missing key points
- 3-4: Partially relevant but mostly off-topic
- 1-2: Barely relevant or mostly unrelated
- 0: Completely irrelevant or wrong topic

Consider:
- Does the answer address what was asked?
- Is the content related to the question topic?
- Does it show understanding of the question?

Return only the relevance score (0-10) as a number.`;

  try {
    const result = await generateInterviewQuestions(prompt);
    const relevanceScore = parseInt(result.match(/\d+/)?.[0] || '5', 10);
    return Math.max(0, Math.min(10, relevanceScore));
  } catch (error) {
    console.error('Relevance check error:', error);
    // Enhanced fallback: better relevance check based on keyword matching
    if (!userAnswer || userAnswer.trim().length === 0) return 0;
    
    const userText = userAnswer.trim().toLowerCase();
    const questionText = question.trim().toLowerCase();
    
    // Extract key words from question (nouns, verbs, adjectives)
    const questionWords = questionText.split(/\s+/).filter(word => word.length > 3);
    const userWords = userText.split(/\s+/).filter(word => word.length > 3);
    const commonWords = questionWords.filter(word => userWords.includes(word));
    
    // Calculate relevance based on word overlap
    const relevanceRatio = questionWords.length > 0 ? commonWords.length / questionWords.length : 0;
    
    // Map to 0-10 scale
    if (relevanceRatio === 0) return 0;
    if (relevanceRatio < 0.1) return 1;
    if (relevanceRatio < 0.2) return 2;
    if (relevanceRatio < 0.3) return 3;
    if (relevanceRatio < 0.4) return 4;
    if (relevanceRatio < 0.5) return 5;
    if (relevanceRatio < 0.6) return 6;
    if (relevanceRatio < 0.7) return 7;
    if (relevanceRatio < 0.8) return 8;
    if (relevanceRatio < 0.9) return 9;
    return 10;
  }
}

export async function generateDetailedFeedback(question, userAnswer, idealAnswer, score, relevanceScore) {
  const prompt = `Provide detailed, constructive feedback for this interview response.

Question: ${question}
User Answer: ${userAnswer}
Ideal Answer: ${idealAnswer}
Score: ${score}/10
Relevance Score: ${relevanceScore}/10

Please provide specific, actionable feedback that includes:
1. What was done well
2. Areas for improvement
3. Specific suggestions for better answers
4. Tips for future interviews

Keep the feedback constructive and encouraging. If the score is low, focus on how to improve rather than just pointing out what's wrong.

Return only the feedback text (no additional formatting).`;

  try {
    return await generateInterviewQuestions(prompt);
  } catch (error) {
    console.error('Feedback generation error:', error);
    // Fallback feedback based on score
    if (score <= 2) {
      return "This answer doesn't address the question properly. Please focus on providing relevant information that directly answers what was asked.";
    } else if (score <= 5) {
      return "The answer needs improvement. Try to be more specific and provide more detailed information related to the question.";
    } else {
      return "Good effort! Consider adding more specific examples or details to strengthen your response.";
    }
  }
}

export function categorizeSkill(question, jobRole = '', jobDesc = '') {
  // Simple skill categorization based on keywords
  const q = question.toLowerCase();
  if (q.includes('experience') || q.includes('background') || q.includes('work')) return 'Experience';
  if (q.includes('skill') || q.includes('technology') || q.includes('tool')) return 'Technical Skills';
  if (q.includes('challenge') || q.includes('problem') || q.includes('difficult')) return 'Problem Solving';
  if (q.includes('team') || q.includes('collaboration') || q.includes('work with')) return 'Teamwork';
  if (q.includes('goal') || q.includes('future') || q.includes('plan')) return 'Career Goals';
  if (q.includes('strength') || q.includes('weakness') || q.includes('improve')) return 'Self Assessment';
  return 'General';
} 