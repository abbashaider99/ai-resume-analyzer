// Free AI Service - Multiple providers with fallback
// No authentication required for public models with rate limits

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

interface AIProvider {
  name: string;
  url: string;
  available: boolean;
}

/**
 * Try multiple AI providers with fallback
 */
async function tryMultipleProviders(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  // Try Hugging Face models in order
  const models = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/flan-t5-large',
    'facebook/bart-large-cnn',
  ];

  for (const model of models) {
    try {
      console.log(`Trying ${model}...`);
      
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: options.maxTokens || 500,
              temperature: options.temperature || 0.7,
              top_p: 0.9,
              do_sample: true,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          }),
        }
      );

      if (!response.ok) {
        console.log(`${model} returned ${response.status}, trying next...`);
        continue;
      }

      const data: HuggingFaceResponse[] = await response.json();
      
      if (data[0]?.error) {
        console.log(`${model} error: ${data[0].error}, trying next...`);
        continue;
      }

      const text = data[0]?.generated_text || '';
      if (text && text.length > 10) {
        console.log(`✅ ${model} succeeded!`);
        return text;
      }
    } catch (error) {
      console.log(`${model} failed:`, error);
      continue;
    }
  }

  throw new Error('All AI providers failed');
}

/**
 * Call Hugging Face Inference API (Free) with fallback providers
 */
export async function callHuggingFaceAI(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    retries?: number;
  }
): Promise<string> {
  const maxRetries = options?.retries || 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI attempt ${attempt + 1}/${maxRetries + 1}...`);
      
      const result = await tryMultipleProviders(prompt, {
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      });
      
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Failed after all retry attempts');
}

/**
 * Generate smart resume analysis locally (enhanced fallback)
 */
function generateSmartResumeAnalysis(resumeText: string, jobTitle: string, jobDescription: string): any {
  const text = resumeText.toLowerCase();
  const jobDesc = jobDescription.toLowerCase();
  
  // Extract key information
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasLinkedIn = text.includes('linkedin');
  const hasGithub = text.includes('github');
  
  // Analyze content
  const wordCount = resumeText.split(/\s+/).length;
  const hasNumbers = (resumeText.match(/\d+%|\d+\+|increased|decreased|improved/gi) || []).length;
  const hasActionVerbs = (resumeText.match(/\b(led|managed|developed|created|implemented|designed|built|achieved|improved|increased|reduced)\b/gi) || []).length;
  
  // Check for common sections
  const hasExperience = /experience|work history|employment/i.test(resumeText);
  const hasEducation = /education|degree|university|college/i.test(resumeText);
  const hasSkills = /skills|technologies|tools/i.test(resumeText);
  
  // Job matching
  const jobKeywords = jobDesc.match(/\b[a-z]{4,}\b/g) || [];
  const matchedKeywords = jobKeywords.filter(keyword => text.includes(keyword)).length;
  const keywordScore = Math.min(100, (matchedKeywords / Math.max(jobKeywords.length, 1)) * 100);
  
  // Calculate scores
  const contentScore = Math.min(100, 
    (hasExperience ? 30 : 0) + 
    (hasEducation ? 20 : 0) + 
    (hasSkills ? 20 : 0) + 
    (hasNumbers > 3 ? 15 : hasNumbers * 5) + 
    (hasActionVerbs > 5 ? 15 : hasActionVerbs * 3)
  );
  
  const structureScore = Math.min(100,
    (hasEmail ? 20 : 0) +
    (hasPhone ? 20 : 0) +
    (hasExperience ? 20 : 0) +
    (hasEducation ? 20 : 0) +
    (hasSkills ? 20 : 0)
  );
  
  const atsScore = Math.round(keywordScore);
  const overallScore = Math.round((contentScore + structureScore + atsScore) / 3);
  
  return {
    overallScore,
    toneAndStyle: {
      score: Math.min(100, hasActionVerbs * 8 + 30),
      tips: [
        hasActionVerbs > 5 
          ? { type: "good", tip: "Strong action verbs", explanation: `You're using ${hasActionVerbs} action verbs like 'led', 'developed', and 'achieved' which strengthen your resume.` }
          : { type: "improve", tip: "Use more action verbs", explanation: "Start your bullet points with strong action verbs like 'Led', 'Developed', 'Achieved', 'Implemented'." },
        { type: "improve", tip: "Professional tone", explanation: "Ensure your resume maintains a professional, confident tone throughout. Avoid casual language." }
      ]
    },
    content: {
      score: Math.round(contentScore),
      tips: [
        hasNumbers > 2
          ? { type: "good", tip: "Quantified achievements", explanation: `You've included ${hasNumbers} quantified achievements. This demonstrates measurable impact.` }
          : { type: "improve", tip: "Add quantified achievements", explanation: "Include specific numbers and metrics (e.g., 'Increased sales by 30%', 'Led team of 5 developers', 'Managed $100K budget')." },
        hasExperience
          ? { type: "good", tip: "Relevant experience shown", explanation: "Your work experience section is present and relevant to the target role." }
          : { type: "improve", tip: "Add work experience", explanation: "Include detailed work experience with specific achievements and responsibilities." }
      ]
    },
    structure: {
      score: Math.round(structureScore),
      tips: [
        hasEmail && hasPhone
          ? { type: "good", tip: "Complete contact info", explanation: "Your resume includes email and phone number for easy contact." }
          : { type: "improve", tip: "Add contact information", explanation: "Ensure your resume includes email, phone number, and location." },
        hasExperience && hasEducation && hasSkills
          ? { type: "good", tip: "Well-organized sections", explanation: "Your resume has clear sections for Experience, Education, and Skills." }
          : { type: "improve", tip: "Add standard sections", explanation: "Include standard sections: Contact Info, Summary, Experience, Education, Skills." }
      ]
    },
    skills: {
      score: Math.min(100, (hasSkills ? 50 : 0) + (hasLinkedIn ? 15 : 0) + (hasGithub ? 15 : 0) + 20),
      tips: [
        hasSkills
          ? { type: "good", tip: "Skills section present", explanation: "You've included a skills section highlighting your technical abilities." }
          : { type: "improve", tip: "Add skills section", explanation: "Create a dedicated skills section listing relevant technical skills, tools, and technologies." },
        hasLinkedIn || hasGithub
          ? { type: "good", tip: "Professional links included", explanation: "You've included links to your professional profiles." }
          : { type: "improve", tip: "Add LinkedIn/GitHub", explanation: `Include links to your LinkedIn profile${jobTitle.toLowerCase().includes('developer') || jobTitle.toLowerCase().includes('engineer') ? ' and GitHub' : ''}.` }
      ]
    },
    ATS: {
      score: atsScore,
      tips: [
        matchedKeywords > 5
          ? { type: "good", tip: `${matchedKeywords} job keywords found`, explanation: "Your resume includes many keywords from the job description." }
          : { type: "improve", tip: "Add more job-specific keywords", explanation: `Include more keywords from the job description like: ${jobKeywords.slice(0, 5).join(', ')}.` },
        { type: "improve", tip: "Use standard section headings", explanation: "Use standard ATS-friendly headings: 'Work Experience', 'Education', 'Skills' (not creative names)." },
        wordCount < 200
          ? { type: "improve", tip: "Expand your resume", explanation: "Your resume seems brief. Aim for a more detailed description of your experience and achievements." }
          : { type: "good", tip: "Adequate detail level", explanation: "Your resume has good detail without being too lengthy." }
      ]
    }
  };
}

/**
 * Analyze resume using free AI (with smart fallback)
 */
export async function analyzeResumeWithAI(resumeText: string, jobTitle: string = '', jobDescription: string = ''): Promise<any> {
  // Format prompt for Mistral instruction model
  const prompt = `[INST] You are an expert resume reviewer. Analyze the following resume and provide detailed feedback.

Resume to analyze:
${resumeText.substring(0, 2500)}

Provide your analysis as valid JSON with this exact structure (scores 0-100):
{
  "overallScore": 75,
  "toneAndStyle": {
    "score": 80,
    "tips": [
      {"type": "good", "tip": "Professional tone maintained", "explanation": "Resume uses professional language throughout"},
      {"type": "improve", "tip": "Use more action verbs", "explanation": "Start bullet points with strong action verbs"}
    ]
  },
  "content": {
    "score": 70,
    "tips": [
      {"type": "good", "tip": "Relevant experience shown", "explanation": "Work history is relevant to target role"},
      {"type": "improve", "tip": "Add quantified achievements", "explanation": "Include numbers and metrics (e.g., 'Increased sales by 30%')"}
    ]
  },
  "structure": {
    "score": 75,
    "tips": [
      {"type": "good", "tip": "Clear section organization", "explanation": "Resume is well-organized with distinct sections"}
    ]
  },
  "skills": {
    "score": 70,
    "tips": [
      {"type": "improve", "tip": "List technical skills", "explanation": "Add specific tools and technologies you use"}
    ]
  },
  "ATS": {
    "score": 72,
    "tips": [
      {"type": "improve", "tip": "Include relevant keywords"},
      {"type": "improve", "tip": "Use standard section headings"}
    ]
  }
}

Respond with ONLY the JSON object, no other text. [/INST]`;

  // Try AI first, but use smart fallback if it fails
  try {
    console.log('🤖 Attempting AI-powered resume analysis...');
    
    const response = await callHuggingFaceAI(prompt, {
      maxTokens: 1500,
      temperature: 0.3,
      retries: 1, // Only 1 retry to fail fast and use smart fallback
    });

    console.log('AI Response received, length:', response.length);

    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ AI analysis successful!');
        return parsed;
      } catch (parseError) {
        console.log('JSON parse failed, using smart fallback');
      }
    }
  } catch (error) {
    console.log('⚡ AI unavailable, using smart local analysis');
  }
  
  // Use smart local analysis
  console.log('🧠 Generating intelligent local analysis...');
  return generateSmartResumeAnalysis(resumeText, jobTitle, jobDescription);
}

/**
 * Get BMI health insights using free AI
 */
export async function getBMIInsightsWithAI(
  age: number,
  gender: string,
  bmi: number,
  category: string
): Promise<any> {
  const prompt = `[INST] You are a professional health coach. A ${age}-year-old ${gender} has a BMI of ${bmi.toFixed(1)}, which is classified as ${category}.

Provide personalized health advice in valid JSON format:
{
  "overview": "Brief 2-3 sentence overview of what this BMI means for their health",
  "tips": ["Practical health tip 1", "Practical health tip 2", "Practical health tip 3", "Practical health tip 4", "Practical health tip 5"],
  "mainAction": "One primary action they should take",
  "disclaimer": "Brief medical disclaimer"
}

Respond with ONLY the JSON object. [/INST]`;

  try {
    const response = await callHuggingFaceAI(prompt, {
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      maxTokens: 700,
      temperature: 0.4,
      retries: 2,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ BMI AI analysis successful');
      return parsed;
    }
    
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('❌ BMI AI insights failed:', error);
    throw error;
  }
}

/**
 * Analyze website security using free AI
 */
export async function analyzeWebsiteWithAI(
  domain: string,
  trustScore: number,
  sslStatus: string,
  phishingInfo?: any
): Promise<any> {
  const prompt = `[INST] You are a cybersecurity expert. Analyze this website's security:

Domain: ${domain}
Trust Score: ${trustScore}/100
SSL Status: ${sslStatus}
${phishingInfo?.isPhishing ? `⚠️ PHISHING DETECTED (Confidence: ${phishingInfo.confidence}%)` : '✓ No phishing detected'}

Provide your security analysis in valid JSON format:
{
  "aiInsights": ["Key security insight 1", "Key security insight 2", "Key security insight 3", "Key security insight 4"],
  "riskLevel": "Low/Medium/High/Critical",
  "recommendation": "Your main recommendation for users"
}

Respond with ONLY the JSON object. [/INST]`;

  try {
    const response = await callHuggingFaceAI(prompt, {
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      maxTokens: 600,
      temperature: 0.4,
      retries: 2,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Website AI analysis successful');
      return parsed;
    }
    
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('❌ Website AI analysis failed:', error);
    throw error;
  }
}

/**
 * Check if Hugging Face API is available
 */
export async function checkHuggingFaceAPI(): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      { method: 'HEAD' }
    );
    return response.ok;
  } catch {
    return false;
  }
}
