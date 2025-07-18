import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

export interface StoryGenerationRequest {
  characterName: string;
  characterType: string;
  personality: string;
  genre: string;
  chapterNumber: number;
  previousChoice?: string;
  previousContent?: string;
  characterImageUrl?: string;
  characterStats?: {
    courage?: number;
    kindness?: number;
    wisdom?: number;
    creativity?: number;
    strength?: number;
    friendship?: number;
  };
}

export interface StoryChapterResponse {
  content: string;
  choices?: {
    optionA: {
      text: string;
      description: string;
      statChanges?: {
        courage?: number;
        kindness?: number;
        wisdom?: number;
        creativity?: number;
        strength?: number;
        friendship?: number;
      };
    };
    optionB: {
      text: string;
      description: string;
      statChanges?: {
        courage?: number;
        kindness?: number;
        wisdom?: number;
        creativity?: number;
        strength?: number;
        friendship?: number;
      };
    };
  };
}

export async function generateStoryChapter(request: StoryGenerationRequest): Promise<StoryChapterResponse> {
  // Only add choices every 2-3 chapters, not every chapter
  const shouldIncludeChoices = request.chapterNumber % 3 === 0 || request.chapterNumber === 1;
  
  const statsText = request.characterStats ? 
    `Character stats: Courage ${request.characterStats.courage}/100, Kindness ${request.characterStats.kindness}/100, Wisdom ${request.characterStats.wisdom}/100, Creativity ${request.characterStats.creativity}/100, Strength ${request.characterStats.strength}/100, Friendship ${request.characterStats.friendship}/100.` : '';

  const systemPrompt = `You are a creative children's story writer. Create engaging, age-appropriate stories for kids aged 6-12. 
  All content must be:
  - Positive and encouraging
  - Safe and non-violent
  - Educational and inspiring
  - Fun and imaginative
  
  ${shouldIncludeChoices ? `Return your response as JSON with choices:
  {
    "content": "The story chapter content (150-200 words)",
    "choices": {
      "optionA": {
        "text": "Brief choice description",
        "description": "What might happen if they choose this",
        "statChanges": {
          "courage": 5,
          "kindness": 0,
          "wisdom": 0,
          "creativity": 0,
          "strength": 0,
          "friendship": 0
        }
      },
      "optionB": {
        "text": "Brief choice description", 
        "description": "What might happen if they choose this",
        "statChanges": {
          "courage": 0,
          "kindness": 5,
          "wisdom": 0,
          "creativity": 0,
          "strength": 0,
          "friendship": 0
        }
      }
    }
  }` : `Return your response as JSON without choices:
  {
    "content": "The story chapter content (150-200 words)"
  }`}`;

  const userPrompt = `Create chapter ${request.chapterNumber} of a ${request.genre} story featuring ${request.characterName}, a ${request.characterType} with the personality: ${request.personality}.
  ${statsText}
  ${request.previousChoice ? `Previous choice made: ${request.previousChoice}` : ''}
  ${request.previousContent ? `Previous chapter content: ${request.previousContent}` : ''}
  
  Keep the language simple and positive. Each chapter should be around 150-200 words.
  ${shouldIncludeChoices ? 'Include exactly 2 choice options for the reader to continue the story. Each choice should include stat changes based on the action (+5 to +10 for positive traits, -5 to -10 for negative traits). Consider how each choice would affect the character\'s courage, kindness, wisdom, creativity, strength, and friendship.' : 'This chapter should continue the story naturally without choices.'}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response structure
    if (!result.content) {
      throw new Error('Invalid response structure from OpenAI - missing content');
    }

    // If choices are expected but missing, throw error
    if (shouldIncludeChoices && (!result.choices || !result.choices.optionA || !result.choices.optionB)) {
      throw new Error('Invalid response structure from OpenAI - missing choices');
    }

    return result;
  } catch (error) {
    console.error('Error generating story chapter:', error);
    throw new Error('Failed to generate story chapter. Please try again.');
  }
}

export async function generateStoryImage(description: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a colorful, child-friendly illustration for a children's story: ${description}. Style: cartoon, bright colors, safe for kids, no scary elements.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error('Error generating story image:', error);
    // Return a placeholder or empty string instead of throwing
    return '';
  }
}
