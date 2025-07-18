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
    console.log('Using fallback story generation...');
    
    // Enhanced fallback story generation
    return generateFallbackStory(request, shouldIncludeChoices);
  }
}

// Enhanced fallback story generation
function generateFallbackStory(request: StoryGenerationRequest, shouldIncludeChoices: boolean): StoryChapterResponse {
  const { characterName, characterType, personality, genre, chapterNumber, previousChoice, characterStats } = request;
  
  // Story templates based on genre and chapter number
  const storyTemplates = {
    adventure: [
      `${characterName} the ${personality} ${characterType} stood at the edge of a mysterious forest. The tall trees seemed to whisper secrets in the wind. With ${characterStats?.courage || 50} courage points, ${characterName} felt ready for whatever lay ahead. The path split into two directions - one led to a sparkling stream, the other to a cave with glowing crystals.`,
      `Deep in the adventure, ${characterName} discovered an ancient map hidden in a tree hollow. The map showed a treasure marked with an X! But it also revealed dangerous obstacles along the way. ${characterName} used their ${personality} nature to carefully study the map and plan the next move.`,
      `${characterName} faced their biggest challenge yet - a rickety bridge over a rushing river. The ${characterType} had to use all their skills to cross safely. With ${characterStats?.strength || 50} strength and ${characterStats?.wisdom || 50} wisdom, they made a careful plan.`,
      `At the heart of the adventure, ${characterName} found what they were looking for - but it wasn't what they expected! The real treasure was the friends they made and the lessons they learned. Their ${personality} personality had helped them overcome every obstacle.`
    ],
    fantasy: [
      `In the magical kingdom, ${characterName} the ${personality} ${characterType} discovered they had special powers! Sparkles of magic danced around their fingers as they learned to use their gifts. The village elder explained that ${characterName} was chosen for a very important quest.`,
      `${characterName} entered the enchanted forest where the trees could talk and the flowers sang beautiful songs. A wise old oak tree told them about a spell that needed to be broken. With ${characterStats?.wisdom || 50} wisdom points, ${characterName} listened carefully to the tree's advice.`,
      `Flying through the clouds on a friendly dragon, ${characterName} saw the magical kingdom spread out below like a colorful patchwork quilt. The dragon explained that dark clouds were approaching, and only someone with a ${personality} heart could help bring back the sunshine.`,
      `${characterName} stood in the grand castle, facing the final challenge. All their adventures had led to this moment. With kindness at ${characterStats?.kindness || 50} and creativity at ${characterStats?.creativity || 50}, they knew exactly what to do to save the kingdom.`
    ],
    mystery: [
      `Detective ${characterName} the ${personality} ${characterType} found a curious clue in the school library - a book with pages that glowed in the dark! The mystery was getting more interesting by the minute. ${characterName} carefully examined the strange symbols written in the margins.`,
      `The mystery deepened when ${characterName} discovered a secret door behind the old grandfather clock. With ${characterStats?.courage || 50} courage points, they decided to explore the hidden passage. The flashlight beam revealed footprints in the dust - someone had been here recently!`,
      `${characterName} gathered all the clues they had found: the glowing book, the secret passage, and now a mysterious key. Their ${personality} nature helped them see the connections between all the pieces. The solution was starting to come together!`,
      `In the final chapter of the mystery, ${characterName} revealed the truth to everyone. All the clues had led to an amazing discovery - the missing treasure was actually a collection of beautiful stories written by students from long ago. The real treasure was the joy of reading and sharing stories!`
    ]
  };
  
  const templates = storyTemplates[genre as keyof typeof storyTemplates] || storyTemplates.adventure;
  const templateIndex = Math.min(chapterNumber - 1, templates.length - 1);
  let content = templates[templateIndex];
  
  // Add reference to previous choice if provided
  if (previousChoice) {
    content = `After choosing to ${previousChoice.toLowerCase()}, ` + content;
  }
  
  // Generate appropriate choices based on story context
  const choices = shouldIncludeChoices ? generateStoryChoices(request) : undefined;
  
  return {
    content,
    choices
  };
}

function generateStoryChoices(request: StoryGenerationRequest) {
  const { genre, chapterNumber, characterStats } = request;
  
  // Different choice types based on genre and chapter
  const choiceTemplates = {
    adventure: {
      early: [
        {
          optionA: { text: "Explore the mysterious cave", description: "Venture into the unknown depths", statChanges: { courage: 8, wisdom: 5 } },
          optionB: { text: "Follow the forest path", description: "Take the safer route through nature", statChanges: { kindness: 6, friendship: 4 } }
        },
        {
          optionA: { text: "Climb the tall mountain", description: "Challenge yourself with the difficult climb", statChanges: { strength: 7, courage: 5 } },
          optionB: { text: "Help the lost travelers", description: "Use your skills to guide others", statChanges: { kindness: 8, friendship: 6 } }
        }
      ],
      late: [
        {
          optionA: { text: "Face the challenge head-on", description: "Use all your courage to overcome the obstacle", statChanges: { courage: 10, strength: 5 } },
          optionB: { text: "Find a creative solution", description: "Think outside the box to solve the problem", statChanges: { creativity: 9, wisdom: 6 } }
        }
      ]
    },
    fantasy: {
      early: [
        {
          optionA: { text: "Learn a new spell", description: "Practice your magical abilities", statChanges: { creativity: 8, wisdom: 5 } },
          optionB: { text: "Help the magical creatures", description: "Use your kindness to make new friends", statChanges: { kindness: 9, friendship: 7 } }
        }
      ],
      late: [
        {
          optionA: { text: "Use powerful magic", description: "Channel all your magical energy", statChanges: { creativity: 10, strength: 6 } },
          optionB: { text: "Unite everyone together", description: "Bring all the kingdom's friends to help", statChanges: { friendship: 10, kindness: 8 } }
        }
      ]
    },
    mystery: {
      early: [
        {
          optionA: { text: "Investigate the clues carefully", description: "Use your detective skills to examine evidence", statChanges: { wisdom: 8, courage: 4 } },
          optionB: { text: "Ask friends for help", description: "Work together to solve the mystery", statChanges: { friendship: 7, kindness: 5 } }
        }
      ],
      late: [
        {
          optionA: { text: "Reveal the solution", description: "Use all your clues to solve the mystery", statChanges: { wisdom: 10, courage: 6 } },
          optionB: { text: "Share the discovery", description: "Include everyone in the exciting revelation", statChanges: { friendship: 9, kindness: 7 } }
        }
      ]
    }
  };
  
  const genreChoices = choiceTemplates[genre as keyof typeof choiceTemplates] || choiceTemplates.adventure;
  const isEarly = chapterNumber <= 3;
  const choiceSet = isEarly ? genreChoices.early : genreChoices.late;
  const choiceIndex = Math.floor(Math.random() * choiceSet.length);
  
  return choiceSet[choiceIndex];
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