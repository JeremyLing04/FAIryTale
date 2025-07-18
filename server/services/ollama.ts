import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Remote AI server configuration
const AI_SERVER_URL = process.env.LOCAL_AI_SERVER_URL;
const AI_MODE = process.env.AI_MODE || 'local';

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

// Function to check if Ollama is available
async function isOllamaAvailable(): Promise<boolean> {
  try {
    await execAsync('ollama --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Fallback story generation when Ollama is not available
function generateFallbackStory(request: StoryGenerationRequest): StoryChapterResponse {
  const { characterName, characterType, personality, genre, chapterNumber } = request;
  const shouldIncludeChoices = chapterNumber % 3 === 0 || chapterNumber === 1;
  
  const stories = {
    1: `Chapter ${chapterNumber}: Welcome to the beginning of ${characterName}'s amazing ${genre} adventure! 

${characterName} the ${personality} ${characterType} stood at the edge of a magical forest, their heart filled with excitement. The trees whispered ancient secrets, and colorful butterflies danced through beams of golden sunlight.

As ${characterName} took their first steps into this enchanted world, they discovered a sparkling stream that seemed to glow with magical energy. The water sang a gentle melody that made them feel brave and curious about what lay ahead.

"This is going to be the most wonderful adventure ever!" ${characterName} thought, feeling ready to explore all the mysteries this magical place had to offer.`,
    
    2: `Chapter ${chapterNumber}: ${characterName} continues deeper into the magical realm, where every step brings new wonders.

Walking along the enchanted path, ${characterName} discovered a grove where flowers changed colors with each step. Red roses turned to golden sunflowers, then to purple lavender that filled the air with sweet perfume.

In the center of the grove stood a wise old tree with a face carved in its bark. "Welcome, young ${characterType}," the tree said with a voice like rustling leaves. "I am the Guardian of Stories, and I have been waiting for someone like you."

The tree's branches swayed gently, revealing a hidden doorway glowing with soft, rainbow light. ${characterName} felt a mix of wonder and curiosity about what magical secrets lay beyond.`,
    
    default: `Chapter ${chapterNumber}: ${characterName}'s ${genre} adventure takes an exciting turn!

With their ${personality} spirit shining bright, ${characterName} the ${characterType} faced the challenges ahead with courage and determination. Each step of the journey taught them something new about friendship, bravery, and the magic that exists in believing in yourself.

The world around them sparkled with possibilities, and ${characterName} knew that no matter what happened next, they were ready for any adventure that came their way. Their heart was full of hope and excitement for the chapters still to come.

"Every day brings new magic when you're brave enough to look for it," ${characterName} whispered to themselves, smiling at the wonderful journey they were on.`
  };

  const content = stories[chapterNumber as keyof typeof stories] || stories.default;
  
  if (!shouldIncludeChoices) {
    return { content };
  }

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
  // Try remote AI server first if configured
  if (AI_MODE === 'remote' && AI_SERVER_URL) {
    try {
      console.log('Attempting remote AI story generation...');
      const response = await fetch(`${AI_SERVER_URL}/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        timeout: 30000 // 30 second timeout
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Remote AI story generation successful');
        return result;
      } else {
        console.log('Remote AI server returned error:', response.status);
      }
    } catch (error) {
      console.error('Remote AI server connection failed:', error);
    }
  }

  // Check if Ollama is available locally
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

  try {
    // Use Ollama with Mistral model - properly escape the prompt
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const command = process.platform === 'win32' 
      ? `ollama run mistral "${escapedPrompt}"`
      : `ollama run mistral '${prompt.replace(/'/g, "'\\''")}''`;
    
    console.log('Running Ollama command for story generation...');
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
    
    if (stderr) {
      console.log('Ollama stderr (may be normal):', stderr);
    }
    
    // Try to parse the JSON response
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed Ollama JSON response');
        return result as StoryChapterResponse;
      } catch (parseError) {
        console.log('Failed to parse Ollama JSON, using text output');
      }
    }
    
    // If no JSON found, create a structured response from the text
    const content = stdout.trim() || "The adventure continues...";
    return {
      content,
      ...(shouldIncludeChoices && {
        choices: {
          optionA: {
            text: "Continue the adventure",
            description: "Keep exploring with courage",
            statChanges: { courage: 5, wisdom: 2 }
          },
          optionB: {
            text: "Help someone in need",
            description: "Stop to assist others",
            statChanges: { kindness: 5, friendship: 3 }
          }
        }
      })
    };
  } catch (error) {
    console.error('Error generating story with Ollama:', error);
    // Use the fallback function
    return generateFallbackStory(request);
  }
}

// Function to check if Python is available
async function isPythonAvailable(): Promise<boolean> {
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

export async function generateStoryImage(description: string, characterImageUrl?: string, genre: string = "cartoon"): Promise<string> {
  // Try remote AI server first if configured
  if (AI_MODE === 'remote' && AI_SERVER_URL) {
    try {
      console.log('Attempting remote AI image generation...');
      const response = await fetch(`${AI_SERVER_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          characterImage: characterImageUrl,
          genre,
          timestamp: Date.now()
        }),
        timeout: 120000 // 2 minute timeout for image generation
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.image) {
          console.log('Remote AI image generation successful');
          return result.image;
        }
      } else {
        console.log('Remote AI image server returned error:', response.status);
      }
    } catch (error) {
      console.error('Remote AI image server connection failed:', error);
    }
  }

  // Check if Python is available locally
  const pythonAvailable = await isPythonAvailable();
  
  if (!pythonAvailable) {
    console.log('Python not available, skipping image generation');
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
    
    // Create output directory for app.py (it expects specific structure)
    const outputDir = path.join(imagesDir, 'story_images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Build character description for the story
    const characterDesc = `a ${genre} style character in an animated art style, cinematic lighting`;
    
    // Build the command for your Stable Diffusion v1.5 + IP-Adapter script
    let command;
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    if (venvExists) {
      // Use venv if it exists
      const activateScript = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'activate.bat')
        : path.join(venvPath, 'bin', 'activate');
      
      if (process.platform === 'win32') {
        command = `"${activateScript}" && ${pythonCmd} app.py --character "${characterDesc}" --story "${description}" --output_dir "${outputDir}" --seed ${timestamp % 9999} --steps 25 --scale 7.5`;
      } else {
        command = `source "${activateScript}" && ${pythonCmd} app.py --character "${characterDesc}" --story "${description}" --output_dir "${outputDir}" --seed ${timestamp % 9999} --steps 25 --scale 7.5`;
      }
    } else {
      // Use system python if no venv
      command = `${pythonCmd} app.py --character "${characterDesc}" --story "${description}" --output_dir "${outputDir}" --seed ${timestamp % 9999} --steps 25 --scale 7.5`;
    }
    
    // Add character reference image if provided (IP-Adapter)
    if (characterImageUrl && characterImageUrl.startsWith('data:')) {
      // Save base64 image to temporary file for IP-Adapter reference
      const tempImagePath = path.join(imagesDir, `reference_${timestamp}.png`);
      const base64Data = characterImageUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(tempImagePath, base64Data, 'base64');
      command += ` --reference "${tempImagePath}"`;
    } else if (characterImageUrl && !characterImageUrl.startsWith('http')) {
      // Local file path
      command += ` --reference "${characterImageUrl}"`;
    }
    
    // Add LoRA style if genre-specific styles are available
    const styleMap: Record<string, string> = {
      'fantasy': 'anime_style.safetensors',
      'adventure': 'anime_style.safetensors', 
      'mystery': 'anime_style.safetensors',
      'scifi': 'anime_style.safetensors'
    };
    
    if (styleMap[genre.toLowerCase()]) {
      command += ` --style_lora "${styleMap[genre.toLowerCase()]}"`;
    }
    
    console.log('Running image generation command:', command);
    console.log('Virtual environment detected:', venvExists);
    
    const { stdout, stderr } = await execAsync(command, { 
      shell: true,
      timeout: 120000 // 2 minute timeout for SD generation
    });
    
    if (stderr) {
      console.error('Image generation stderr:', stderr);
    }
    
    if (stdout) {
      console.log('Image generation stdout:', stdout);
    }
    
    // Your app.py generates images in the output_dir with sequential names (00.png, 01.png, etc.)
    // Find the most recently created image
    const generatedImagePath = path.join(outputDir, '00.png'); // First image from story sequence
    
    if (fs.existsSync(generatedImagePath)) {
      // Copy the generated image to our expected location
      const finalPath = path.join(imagesDir, `story_${timestamp}.png`);
      fs.copyFileSync(generatedImagePath, finalPath);
      
      // Clean up temporary files
      if (characterImageUrl && characterImageUrl.startsWith('data:')) {
        const tempImagePath = path.join(imagesDir, `reference_${timestamp}.png`);
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
      }
      
      // Clean up generated story images (optional - comment out if you want to keep them)
      try {
        const files = fs.readdirSync(outputDir);
        files.forEach(file => {
          if (file.endsWith('.png')) {
            fs.unlinkSync(path.join(outputDir, file));
          }
        });
      } catch (cleanupError) {
        console.log('Cleanup warning:', cleanupError);
      }
      
      return `/generated_images/story_${timestamp}.png`;
    } else {
      console.error('Generated image file not found:', generatedImagePath);
      return characterImageUrl || "";
    }
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a placeholder or the character image if available
    return characterImageUrl || "";
  }
}