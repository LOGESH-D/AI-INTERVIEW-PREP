const GEMINI_API_KEY = "AIzaSyCQl_KAj2qlf-dtskWAE7x9hJ3Ps3J4Vdg";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Test function to check if API is working
export async function testGeminiAPI() {
  try {
    const testPrompt = "Hello, this is a test. Please respond with 'API is working'.";
    const result = await generateInterviewQuestions(testPrompt);
    console.log('Gemini API test result:', result);
    return result.includes('API is working') || result.length > 0;
  } catch (error) {
    console.error('Gemini API test failed:', error);
    return false;
  }
}

export async function generateInterviewQuestions(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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

      console.log(`Making Gemini API call (attempt ${attempt}/${retries}) with prompt:`, prompt.substring(0, 100) + '...');

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error response (attempt ${attempt}):`, errorText);
        
        if (attempt === retries) {
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      const data = await response.json();
      console.log('Gemini API response data:', data);
      
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log('Gemini API result:', result);
      
      if (!result || result.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      
      return result;
    } catch (error) {
      console.error(`Gemini API call failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
} 