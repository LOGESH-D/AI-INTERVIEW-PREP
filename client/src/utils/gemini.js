// Backend API endpoint for Gemini calls - prefer env base URL, fallback to 5000
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_API_URL = `${API_BASE}/gemini`;

// Test function to check if API is working
export async function testGeminiAPI() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API test result:', data);
    return data.success && data.result.includes('API is working');
  } catch (error) {
    console.error('Gemini API test failed:', error);
    return false;
  }
}

export async function generateInterviewQuestions(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Making backend API call (attempt ${attempt}/${retries}) with prompt:`, prompt.substring(0, 100) + '...');

      const response = await fetch(`${BACKEND_API_URL}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      console.log('Backend API response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {
          const errorText = await response.text();
          try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText || 'Unknown error' }; }
        }
        console.error(`Backend API error response (attempt ${attempt}):`, errorData);
        
        // Handle rate limiting specifically with exponential backoff
        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 2000; // 4s, 8s, 16s
          console.log(`Rate limit hit (429), waiting ${waitTime}ms before retry`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        if (attempt === retries) {
          throw new Error(`Backend API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        
        // Standard retry delay for other errors
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      const data = await response.json();
      console.log('Backend API response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Backend API returned unsuccessful response');
      }
      
      const result = data.result || "";
      console.log('Generated result:', result);
      
      if (!result || result.trim().length === 0) {
        throw new Error('Empty response from backend API');
      }
      
      return result;
    } catch (error) {
      console.error(`Backend API call failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff for network errors
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Helper function for retry with exponential backoff
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      console.warn(`429 Too Many Requests, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // exponential backoff
        continue;
      }
    }
    return res;
  }
  throw new Error("Max retries reached (429 Too Many Requests)");
}

// New function to generate both questions and skills in a single request
export async function generateInterviewData(jobPosition, jobDesc, jobExperience, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Making backend API call for interview data generation (attempt ${attempt}/${retries})`);

      const response = await fetchWithRetry(`${BACKEND_API_URL}/generate-interview-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosition, jobDesc, jobExperience })
      }, retries, 2000); // Start with 2s delay

      console.log('Backend API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Backend API error response (attempt ${attempt}):`, errorData);
        
        // Handle rate limiting specifically with exponential backoff
        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 2000; // 4s, 8s, 16s
          console.log(`Rate limit hit (429), waiting ${waitTime}ms before retry`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        if (attempt === retries) {
          throw new Error(`Backend API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        
        // Standard retry delay for other errors
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      const data = await response.json();
      console.log('Backend API response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Backend API returned unsuccessful response');
      }
      
      return {
        questions: data.questions || [],
        ideals: data.ideals || [],
        skills: data.skills || []
      };
    } catch (error) {
      console.error(`Backend API call failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff for network errors
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
} 