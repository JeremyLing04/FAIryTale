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
  const systemPrompt = `You are a creative children's story writer. Create engaging, age-appropriate stories for kids aged 6-12. 
  All content must be:
  - Positive and encouraging
  - Safe and non-violent
  - Educational and inspiring
  - Fun and imaginative
  
  Return your response as JSON with the following structure:
  {
    "content": "The story chapter content (200-300 words)",
    "choices": {
      "optionA": {
        "text": "Brief choice description",
        "description": "What might happen if they choose this"
      },
      "optionB": {
        "text": "Brief choice description", 
        "description": "What might happen if they choose this"
      }
    }
  }`;

  const userPrompt = `Create chapter ${request.chapterNumber} of a ${request.genre} story featuring ${request.characterName}, a ${request.characterType} with a ${request.personality} personality.
  
  ${request.previousChoice ? `The character previously chose: ${request.previousChoice}` : ''}
  ${request.previousContent ? `Previous story content: ${request.previousContent}` : ''}
  
  Make the story engaging with vivid descriptions and give two meaningful choices that will affect the story direction.`;

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
    if (!result.content || !result.choices || !result.choices.optionA || !result.choices.optionB) {
      throw new Error('Invalid response structure from OpenAI');
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
