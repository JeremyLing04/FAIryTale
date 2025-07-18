import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface StoryGenerationRequest {
  characterName: string;
  characterType: string;
  personality: string;
  genre: string;
  chapterNumber: number;
  previousChoice?: string;
  previousContent?: string;
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

// Check if Ollama is available (local or remote)
export async function isOllamaAvailable(): Promise<boolean> {
  // Check for remote Ollama endpoint first
  const remoteOllamaUrl = process.env.OLLAMA_HOST || process.env.REMOTE_OLLAMA_URL;
  if (remoteOllamaUrl) {
    try {
      const response = await fetch(`${remoteOllamaUrl}/api/tags`);
      return response.ok;
    } catch (error: any) {
      console.log('Remote Ollama not accessible:', error?.message || error);
    }
  }
  
  // Fall back to local Ollama check
  try {
    await execAsync('ollama --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Fallback story generation when Ollama is not available
function generateFallbackStory(request: StoryGenerationRequest): StoryChapterResponse {
  const { characterName, characterType, genre, chapterNumber, personality } = request;
  
  const storyTemplates = {
    fantasy: [
      `${characterName} the ${characterType} discovered a shimmering portal hidden behind ancient oak trees. With ${personality} determination, they stepped through into a magical realm filled with floating islands and crystal waterfalls.`,
      `The magical realm welcomed ${characterName} with whispers of ancient magic. Their ${personality} nature helped them befriend a wise talking fox who offered to guide them to the Crystal of Courage.`,
      `${characterName} and their fox companion reached the Crystal Cave. The ${personality} ${characterType} felt the crystal's warm glow, knowing this was the key to saving their village from the endless winter.`
    ],
    adventure: [
      `${characterName} the ${characterType} set sail on the merchant ship "Starlight." With their ${personality} spirit, they quickly became friends with the crew as they headed toward the mysterious Treasure Island.`,
      `A storm hit the Starlight, but ${characterName}'s ${personality} courage helped rally the crew. Together they spotted a hidden cove where they could shelter and discovered an old treasure map.`,
      `Following the treasure map, ${characterName} led the crew through a jungle filled with colorful parrots and friendly monkeys. Their ${personality} nature helped them solve the riddles protecting the treasure.`
    ],
    mystery: [
      `Detective ${characterName} the ${characterType} arrived at the old library where books had been mysteriously disappearing. With their ${personality} approach, they began searching for clues among the dusty shelves.`,
      `${characterName} discovered a secret passage behind the history section. Their ${personality} nature helped them bravely explore the hidden room filled with glowing, floating books.`,
      `In the secret room, ${characterName} met the Library Guardian, a gentle spirit who had been protecting the magical books. With their ${personality} heart, they helped solve the mystery of the disappearing books.`
    ]
  };
  
  const templates = storyTemplates[genre as keyof typeof storyTemplates] || storyTemplates.fantasy;
  const content = templates[Math.min(chapterNumber - 1, templates.length - 1)];

  return {
    content,
    choices: {
      optionA: {
        text: "Explore the magical forest",
        description: "Venture deeper into the enchanted woods to discover hidden secrets",
        statChanges: {
          courage: 5,
          creativity: 3,
          wisdom: 2
        }
      },
      optionB: {
        text: "Help a friendly creature",
        description: "Stop to assist a lost woodland animal find their way home",
        statChanges: {
          kindness: 5,
          friendship: 4,
          wisdom: 1
        }
      }
    }
  };
}

export async function generateStoryChapter(request: StoryGenerationRequest): Promise<StoryChapterResponse> {
  try {
    // Check if Ollama is available
    const ollamaAvailable = await isOllamaAvailable();
    
    if (!ollamaAvailable) {
      console.log('Ollama not available, using fallback story generation');
      return generateFallbackStory(request);
    }

    // Only add choices every 2-3 chapters, not every chapter
    const shouldIncludeChoices = request.chapterNumber % 3 === 0 || request.chapterNumber === 1;
    
    const statsText = request.characterStats ? 
      `Character stats: Courage ${request.characterStats.courage}/100, Kindness ${request.characterStats.kindness}/100, Wisdom ${request.characterStats.wisdom}/100, Creativity ${request.characterStats.creativity}/100, Strength ${request.characterStats.strength}/100, Friendship ${request.characterStats.friendship}/100.` : '';

    const prompt = `You are a children's story writer creating engaging, age-appropriate stories for kids aged 6-12. 
Create chapter ${request.chapterNumber} of a ${request.genre} story featuring ${request.characterName}, a ${request.characterType} with the personality: ${request.personality}.
${statsText}
${request.previousChoice ? `Previous choice made: ${request.previousChoice}` : ''}
${request.previousContent ? `Previous chapter content: ${request.previousContent}` : ''}

Keep the language simple and positive. Each chapter should be around 150-200 words.
${shouldIncludeChoices ? 'Include exactly 2 choice options for the reader to continue the story. Each choice should include stat changes based on the action (+5 to +10 for positive traits, -5 to -10 for negative traits). Consider how each choice would affect the character\'s courage, kindness, wisdom, creativity, strength, and friendship.' : 'This chapter should continue the story naturally without choices.'}

Format your response as JSON with this structure:
{
  "content": "story content here"${shouldIncludeChoices ? `,
  "choices": {
    "optionA": {
      "text": "brief choice text",
      "description": "what happens if they choose this",
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
      "text": "brief choice text", 
      "description": "what happens if they choose this",
      "statChanges": {
        "courage": 0,
        "kindness": 5,
        "wisdom": 0,
        "creativity": 0,
        "strength": 0,
        "friendship": 0
      }
    }
  }` : ''}
}`;

    // Check for remote Ollama endpoint
    const remoteOllamaUrl = process.env.OLLAMA_HOST || process.env.REMOTE_OLLAMA_URL;
    
    if (remoteOllamaUrl) {
      // Use remote Ollama API
      const response = await fetch(`${remoteOllamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.response;
        
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          return parsedResult as StoryChapterResponse;
        }
        
        // Fallback if no JSON found
        return {
          content: content.trim() || "The adventure continues...",
          ...(shouldIncludeChoices && {
            choices: {
              optionA: {
                text: "Continue the adventure",
                description: "Keep exploring"
              },
              optionB: {
                text: "Try something different", 
                description: "Take a new path"
              }
            }
          })
        };
      }
    } else {
      // Use local Ollama with CLI
      const { stdout } = await execAsync(`ollama run mistral "${prompt.replace(/"/g, '\\"')}"`);
      
      // Try to parse the JSON response
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result as StoryChapterResponse;
      }
      
      // Fallback if JSON parsing fails
      return {
        content: stdout.trim() || "The adventure continues...",
        ...(shouldIncludeChoices && {
          choices: {
            optionA: {
              text: "Continue the adventure",
              description: "Keep exploring"
            },
            optionB: {
              text: "Try something different",
              description: "Take a new path"
            }
          }
        })
      };
    }
  } catch (error: any) {
    console.error('Error generating story with Ollama:', error);
    // Fallback response
    return {
      content: `Chapter ${request.chapterNumber}: ${request.characterName} the ${request.characterType} continues their ${request.genre} adventure. With their ${request.personality} personality, they face new challenges and discover amazing things along the way.`,
      ...(request.chapterNumber % 3 === 0 && {
        choices: {
          optionA: {
            text: "Continue the adventure",
            description: "Keep exploring"
          },
          optionB: {
            text: "Try something different",
            description: "Take a new path"
          }
        }
      })
    };
  }
  
  // This should never be reached due to try-catch, but TypeScript requires a return
  return generateFallbackStory(request);
}

// Function to check if Python is available (local or remote)
async function isPythonAvailable(): Promise<boolean> {
  // Check for remote image generation endpoint first
  const remoteImageUrl = process.env.REMOTE_IMAGE_URL;
  if (remoteImageUrl) {
    try {
      const response = await fetch(`${remoteImageUrl}/health`);
      return response.ok;
    } catch (error: any) {
      console.log('Remote image service not accessible:', error?.message || error);
    }
  }
  
  // Fall back to local Python check
  try {
    await execAsync('python --version');
    return true;
  } catch (error) {
    try {
      await execAsync('python3 --version');
      return true;
    } catch (error2) {
      return false;
    }
  }
}

export async function generateStoryImage(description: string, characterImageUrl?: string, genre: string = "cartoon", characterName?: string): Promise<string> {
  // Check for remote image generation endpoint first
  const remoteImageUrl = process.env.REMOTE_IMAGE_URL;
  
  if (remoteImageUrl) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('genre', genre);
      
      // Use provided character name or default to 'hero'
      const charName = characterName || 'hero';
      formData.append('character_name', charName);
      
      if (characterImageUrl) {
        formData.append('character_image', characterImageUrl);
      }
      
      const response = await fetch(`${remoteImageUrl}/generate`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.image_url || "";
      }
    } catch (error) {
      console.error('Error with remote image generation:', error);
    }
  }
  
  // Check if local Python is available
  const pythonAvailable = await isPythonAvailable();
  
  if (!pythonAvailable) {
    console.log('Python not available locally, skipping image generation');
    // Return the character image if available, or empty string
    return characterImageUrl || "";
  }

  try {
    // Ensure the generated_images directory exists
    const imagesDir = path.join(process.cwd(), 'generated_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const outputPath = path.join(imagesDir, `story_${timestamp}.png`);
    
    // Check if venv exists and build appropriate command
    // First check for custom venv path in environment variable
    const customVenvPath = process.env.PYTHON_VENV_PATH;
    const localVenvPath = path.join(process.cwd(), 'venv');
    
    let venvPath = localVenvPath;
    let venvExists = fs.existsSync(localVenvPath);
    
    // If custom venv path is provided, use it instead
    if (customVenvPath && fs.existsSync(customVenvPath)) {
      venvPath = customVenvPath;
      venvExists = true;
    }
    
    // Build the command for Python image generator with optional venv activation
    let command;
    if (venvExists) {
      // Use venv if it exists
      const activateScript = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'activate.bat')
        : path.join(venvPath, 'bin', 'activate');
      
      if (process.platform === 'win32') {
        command = `"${activateScript}" && python app.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
      } else {
        command = `source "${activateScript}" && python app.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
      }
    } else {
      // Use system python if no venv
      command = `python app.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
    }
    
    // Add character image if provided
    if (characterImageUrl && characterImageUrl.startsWith('data:')) {
      // Save base64 image to temporary file
      const tempImagePath = path.join(imagesDir, `temp_${timestamp}.png`);
      const base64Data = characterImageUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(tempImagePath, base64Data, 'base64');
      command += ` --input-image "${tempImagePath}"`;
    } else if (characterImageUrl) {
      command += ` --input-image "${characterImageUrl}"`;
    }
    
    console.log('Running image generation command:', command);
    console.log('Virtual environment detected:', venvExists);
    
    const { stdout, stderr } = await execAsync(command, { 
      shell: process.platform === 'win32' ? 'cmd' : '/bin/bash',
      timeout: 60000 // 60 second timeout
    });
    
    if (stderr) {
      console.error('Image generation stderr:', stderr);
    }
    
    if (stdout) {
      console.log('Image generation stdout:', stdout);
    }
    
    // Check if the output file was created
    if (fs.existsSync(outputPath)) {
      // Clean up temporary files
      if (characterImageUrl && characterImageUrl.startsWith('data:')) {
        const tempImagePath = path.join(imagesDir, `temp_${timestamp}.png`);
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
      return `/generated_images/story_${timestamp}.png`;
    } else {
      console.error('Generated image file not found:', outputPath);
      return characterImageUrl || "";
    }
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a placeholder or the character image if available
    return characterImageUrl || "";
  }
}