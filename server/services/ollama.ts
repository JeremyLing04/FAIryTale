import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

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

  try {
    // Check if Ollama is available
    await execAsync('ollama --version').catch(() => {
      throw new Error('Ollama not found');
    });
    
    // Use Ollama with Mistral model
    const { stdout } = await execAsync(`ollama run mistral "${prompt.replace(/"/g, '\\"')}"`);
    
    // Try to parse the JSON response
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result as StoryChapterResponse;
    }
    
    // Fallback if JSON parsing fails
    return generateFallbackStory(request, shouldIncludeChoices);
    
  } catch (error) {
    console.warn('Ollama not available, using fallback story generation:', error.message);
    return generateFallbackStory(request, shouldIncludeChoices);
  }
}

function generateFallbackStory(request: StoryGenerationRequest, shouldIncludeChoices: boolean): StoryChapterResponse {
  const storyTemplates = {
    adventure: `${request.characterName} the ${request.characterType} ${request.personality === 'brave' ? 'courageously' : request.personality === 'kind' ? 'kindly' : 'cleverly'} explores a mysterious forest. Beautiful butterflies flutter around ancient trees, and a gentle stream bubbles nearby. ${request.characterName} discovers a hidden path that sparkles with golden light. The sound of friendly birds singing fills the air, making this adventure feel magical and safe.`,
    fantasy: `In a land of wonder, ${request.characterName} the ${request.characterType} finds themselves in an enchanted meadow filled with rainbow flowers. Friendly unicorns graze peacefully while crystal clear lakes reflect the beautiful sky. ${request.characterName} feels the magic in the air and knows that amazing adventures await. Everything in this magical world feels warm and welcoming.`,
    mystery: `${request.characterName} the ${request.characterType} discovers an interesting puzzle in a cozy library. Old books with golden edges line the shelves, and sunlight streams through colorful windows. ${request.characterName} finds a treasure map with friendly riddles to solve. Each clue leads to something wonderful and exciting, making this mystery fun and safe to explore.`,
    sci_fi: `${request.characterName} the ${request.characterType} visits a fantastic space station where robots and humans work together happily. The view of sparkling stars and colorful planets through the big windows is breathtaking. ${request.characterName} meets friendly alien creatures who love to share stories and play games. This space adventure is full of wonder and friendship.`,
    friendship: `${request.characterName} the ${request.characterType} enjoys a perfect day with their best friends in a beautiful park. They play games, share snacks, and laugh together under a sunny sky. ${request.characterName} feels so grateful for such wonderful friends who always support each other. Today is all about kindness, fun, and the joy of friendship.`
  };

  const content = storyTemplates[request.genre as keyof typeof storyTemplates] || storyTemplates.adventure;

  const baseResponse: StoryChapterResponse = { content };

  if (shouldIncludeChoices) {
    baseResponse.choices = {
      optionA: {
        text: "Continue exploring",
        description: "Keep going on this wonderful adventure",
        statChanges: {
          courage: 5,
          wisdom: 3
        }
      },
      optionB: {
        text: "Help a friend",
        description: "Stop to help someone in need",
        statChanges: {
          kindness: 5,
          friendship: 3
        }
      }
    };
  }

  return baseResponse;
}

export async function generateStoryImage(description: string, characterImageUrl?: string, genre: string = "cartoon"): Promise<string> {
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
    // Check for custom app.py path in environment or use default paths
    const customAppPath = process.env.PYTHON_APP_PATH;
    const defaultExternalPath = "C:\\Users\\Admin\\Downloads\\Story\\fast_story_gen\\app.py";
    const localAppPath = path.join(process.cwd(), 'app.py');
    
    let appPyPath = localAppPath;
    if (customAppPath && fs.existsSync(customAppPath)) {
      appPyPath = customAppPath;
    } else if (fs.existsSync(defaultExternalPath)) {
      appPyPath = defaultExternalPath;
    }
    
    let command;
    if (venvExists) {
      // Use venv if it exists
      const activateScript = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'activate.bat')
        : path.join(venvPath, 'bin', 'activate');
      
      if (process.platform === 'win32') {
        command = `"${activateScript}" && python "${appPyPath}" --genre ${genre} --description "${description}" --output "${outputPath}"`;
      } else {
        command = `source "${activateScript}" && python "${appPyPath}" --genre ${genre} --description "${description}" --output "${outputPath}"`;
      }
    } else {
      // Use system python if no venv
      command = `python "${appPyPath}" --genre ${genre} --description "${description}" --output "${outputPath}"`;
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
    
    // Check if we can access the app.py file
    if (!fs.existsSync(appPyPath)) {
      console.warn(`Python app.py not found at ${appPyPath}. Image generation will be skipped.`);
      return characterImageUrl || "";
    }
    
    console.log('Running image generation command:', command);
    console.log('Virtual environment detected:', venvExists);
    
    const { stdout, stderr } = await execAsync(command, { 
      shell: true,
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