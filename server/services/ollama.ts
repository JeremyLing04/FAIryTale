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
    // Use Ollama with Mistral model
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
  } catch (error) {
    console.error('Error generating story with Ollama:', error);
    // Fallback response
    return {
      content: `Chapter ${request.chapterNumber}: ${request.characterName} the ${request.characterType} continues their ${request.genre} adventure. With their ${request.personality} personality, they face new challenges and discover amazing things along the way.`,
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
    // Using image_wrapper.py which interfaces with your app.py
    let command;
    
    if (venvExists) {
      // Use venv if it exists
      const activateScript = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'activate.bat')
        : path.join(venvPath, 'bin', 'activate');
      
      if (process.platform === 'win32') {
        command = `"${activateScript}" && python image_wrapper.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
      } else {
        command = `source "${activateScript}" && python image_wrapper.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
      }
    } else {
      // Use system python if no venv
      command = `python image_wrapper.py --genre ${genre} --description "${description}" --output "${outputPath}"`;
    }
    
    // Add character image if provided
    if (characterImageUrl && characterImageUrl.startsWith('data:')) {
      // Save base64 image to temporary file
      const tempImagePath = path.join(imagesDir, `temp_${timestamp}.png`);
      const base64Data = characterImageUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(tempImagePath, base64Data, 'base64');
      command += ` --reference "${tempImagePath}"`;
    } else if (characterImageUrl) {
      command += ` --reference "${characterImageUrl}"`;
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
    
    // Check if the output file was created by the wrapper
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