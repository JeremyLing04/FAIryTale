import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CharacterSuggestion {
  name: string;
  personality: string;
  powers: string[];
  backstory: string;
}

export interface StoryIdeaSuggestion {
  title: string;
  genre: string;
  description: string;
  setting: string;
}

export interface ImageGenerationRequest {
  characterName?: string;
  characterType: string;
  personality: string;
  powers?: string[];
  style?: 'cartoon' | 'illustration' | 'fantasy' | 'colorful';
}

/**
 * Generate character suggestions based on user input
 */
export async function generateCharacterSuggestions(
  characterType: string, 
  userInput?: string
): Promise<CharacterSuggestion[]> {
  try {
    const prompt = userInput 
      ? `Create 3 unique ${characterType} character suggestions based on this idea: "${userInput}". `
      : `Create 3 unique ${characterType} character suggestions. `;
    
    const fullPrompt = prompt + `Each character should be:
    - Age-appropriate for children 6-12
    - Positive and inspiring
    - Diverse and inclusive
    - Have interesting but kid-friendly powers/abilities
    
    Respond with JSON in this format:
    {
      "characters": [
        {
          "name": "character name",
          "personality": "brief personality description",
          "powers": ["power1", "power2", "power3"],
          "backstory": "short, engaging backstory"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: fullPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.characters || [];
  } catch (error) {
    console.error('Error generating character suggestions:', error);
    return [];
  }
}

/**
 * Generate story idea suggestions based on character
 */
export async function generateStoryIdeas(
  characterName: string,
  characterType: string,
  personality: string,
  powers: string[]
): Promise<StoryIdeaSuggestion[]> {
  try {
    const prompt = `Create 4 unique story ideas for a children's story featuring ${characterName}, a ${characterType} with personality: ${personality} and powers: ${powers.join(', ')}.
    
    Stories should be:
    - Age-appropriate for children 6-12
    - Educational and inspiring
    - Diverse in genres and settings
    - Encourage positive values like friendship, courage, kindness
    
    Respond with JSON in this format:
    {
      "stories": [
        {
          "title": "story title",
          "genre": "adventure/fantasy/mystery/friendship/sci-fi/magic",
          "description": "brief story description",
          "setting": "where the story takes place"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.stories || [];
  } catch (error) {
    console.error('Error generating story ideas:', error);
    return [];
  }
}

/**
 * Generate character image using DALL-E 3
 */
export async function generateCharacterImage(request: ImageGenerationRequest): Promise<string | null> {
  try {
    const style = request.style || 'colorful';
    const prompt = `A ${style} illustration of ${request.characterName || 'a character'}, a ${request.characterType} with ${request.personality} personality. ${
      request.powers && request.powers.length > 0 
        ? `Special abilities: ${request.powers.join(', ')}. ` 
        : ''
    }Child-friendly, vibrant colors, positive expression, suitable for children's book illustration. No text or words in the image.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || null;
  } catch (error) {
    console.error('Error generating character image:', error);
    return null;
  }
}

/**
 * Improve character personality description
 */
export async function enhancePersonalityDescription(
  personalityInput: string,
  characterType: string
): Promise<string> {
  try {
    const prompt = `Improve this character personality description for a children's story: "${personalityInput}"
    
    Character type: ${characterType}
    
    Make it:
    - More vivid and engaging for kids
    - Positive and inspiring
    - Age-appropriate for 6-12 year olds
    - Keep it concise (1-2 sentences)
    
    Return only the improved description, no extra text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content?.trim() || personalityInput;
  } catch (error) {
    console.error('Error enhancing personality:', error);
    return personalityInput;
  }
}

/**
 * Generate power suggestions based on character
 */
export async function generatePowerSuggestions(
  characterType: string,
  personality: string
): Promise<string[]> {
  try {
    const prompt = `Suggest 6 unique, child-friendly powers or abilities for a ${characterType} character with ${personality} personality.
    
    Powers should be:
    - Creative and imaginative
    - Positive and helpful
    - Age-appropriate for children 6-12
    - Diverse in nature (not all combat-related)
    
    Respond with JSON in this format:
    {
      "powers": ["power1", "power2", "power3", "power4", "power5", "power6"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.powers || [];
  } catch (error) {
    console.error('Error generating power suggestions:', error);
    return [];
  }
}