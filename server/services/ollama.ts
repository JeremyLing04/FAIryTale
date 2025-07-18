import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Ollama API configuration
const OLLAMA_API_BASE = 'http://localhost:11434';
const MODEL_NAME = 'mistral';

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

// Function to check if Ollama is running and has the model
async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_BASE}/api/tags`);
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.models?.some((model: any) => model.name.includes(MODEL_NAME)) || false;
  } catch (error) {
    return false;
  }
}

// Function to start Ollama and pull model if needed (async background setup)
async function setupOllama(): Promise<boolean> {
  try {
    console.log('Setting up Ollama in background...');
    
    // Start Ollama service
    exec('ollama serve > /dev/null 2>&1 &');
    
    // Start model pull in background without waiting
    setTimeout(async () => {
      try {
        console.log(`Starting background download of ${MODEL_NAME} model...`);
        await execAsync(`ollama pull ${MODEL_NAME}`, { timeout: 300000 }); // 5 min timeout
        console.log(`${MODEL_NAME} model ready for use`);
      } catch (error) {
        console.error('Background model download failed:', error);
      }
    }, 2000);
    
    return false; // Return false to use local generation immediately
  } catch (error) {
    console.error('Failed to setup Ollama:', error);
    return false;
  }
}

// Function to generate story using Ollama API
async function generateWithOllama(prompt: string): Promise<string> {
  const isReady = await checkOllamaStatus() || await setupOllama();
  
  if (!isReady) {
    throw new Error('Ollama not available');
  }

  const response = await fetch(`${OLLAMA_API_BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 1000
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || '';
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
    // Check if Ollama is ready without waiting
    const isOllamaReady = await checkOllamaStatus();
    
    if (isOllamaReady) {
      console.log('Attempting to generate story with Ollama...');
      const response = await generateWithOllama(prompt);
      
      // Try to parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          console.log('Successfully generated story with Ollama');
          return result as StoryChapterResponse;
        } catch (parseError) {
          console.error('Failed to parse Ollama JSON response:', parseError);
        }
      }
      
      // If we got a response but couldn't parse JSON, create a structured response
      if (response.trim()) {
        console.log('Got response from Ollama but couldn\'t parse JSON, creating structured response');
        return {
          content: response.trim(),
          ...(shouldIncludeChoices && {
            choices: {
              optionA: {
                text: "Continue the adventure",
                description: "Keep exploring with courage",
                statChanges: { courage: 5, kindness: 0, wisdom: 0, creativity: 0, strength: 0, friendship: 0 }
              },
              optionB: {
                text: "Help someone in need",
                description: "Show kindness to others",
                statChanges: { courage: 0, kindness: 5, wisdom: 0, creativity: 0, strength: 0, friendship: 0 }
              }
            }
          })
        };
      }
    }
    
    // Use local generation immediately if Ollama not ready
    console.log('Ollama not ready, using enhanced local story generation');
    return generateLocalStory(request, shouldIncludeChoices);
  } catch (error) {
    console.error('Error with Ollama, using creative local generation:', error);
    
    // Rich story generation system with templates and dynamic content
    return generateLocalStory(request, shouldIncludeChoices);
  }
}

// Local story generation function with rich templates
function generateLocalStory(request: StoryGenerationRequest, shouldIncludeChoices: boolean): StoryChapterResponse {
  const { characterName, characterType, personality, genre, chapterNumber, previousContent, previousChoice } = request;
  
  // Story templates by genre and chapter type
  const storyTemplates = {
    adventure: [
      `${characterName} ventures deeper into the mysterious {location}. The air {atmosphere}, and every shadow seems to hold a secret waiting to be discovered. With {personality_trait} determination, our {characterType} hero notices {discovery} that sparks their curiosity.`,
      `The path ahead splits into {branches}. ${characterName} pauses, remembering the lessons learned from {past_experience}. The {characterType}'s {personality_trait} nature guides them as they consider which way will lead to the greatest adventure.`,
      `Suddenly, ${characterName} encounters {character_encounter}. The {characterType}'s eyes light up with {emotion} as they realize this meeting could change everything. Their {personality_trait} personality shines through as they decide how to approach this new situation.`
    ],
    fantasy: [
      `Magic crackles in the air around ${characterName} as they discover {magical_element}. The {characterType}'s {personality_trait} spirit allows them to sense the ancient power that flows through this enchanted realm.`,
      `${characterName} meets {fantasy_creature} who shares {wisdom_or_challenge}. With their {personality_trait} heart, the {characterType} listens carefully, understanding that this encounter will shape their magical journey.`,
      `The mystical {magical_location} reveals its secrets to ${characterName}. As a {personality_trait} {characterType}, they approach the magical mysteries with both wonder and respect.`
    ],
    mystery: [
      `${characterName} discovers {clue} that doesn't quite fit with everything they've learned so far. The {characterType}'s {personality_trait} nature drives them to look closer and ask the right questions.`,
      `A puzzling {mystery_element} appears before ${characterName}. Using their {personality_trait} approach, the clever {characterType} begins to piece together the clues they've gathered.`,
      `${characterName} realizes that {revelation} changes everything they thought they knew. The {characterType}'s {personality_trait} wisdom helps them see connections others might miss.`
    ]
  };
  
  // Dynamic content pools
  const contentPools = {
    location: ["ancient temple", "hidden valley", "crystal cavern", "floating island", "secret garden", "abandoned castle", "mystical forest", "underground city"],
    atmosphere: ["shimmers with golden light", "hums with mysterious energy", "feels charged with magic", "whispers with ancient voices", "glows with soft moonbeams"],
    discovery: ["a glowing crystal half-buried in the ground", "strange symbols carved into the stone", "a melody carried on the wind", "footprints leading deeper into the unknown", "a locked door with no visible key"],
    branches: ["two winding paths", "three tunnels carved into the rock", "multiple bridges spanning a misty gorge", "several doors of different colors"],
    past_experience: ["their training", "wise words from a friend", "a lesson from their adventures", "their inner strength"],
    character_encounter: ["a friendly guardian spirit", "a lost traveler seeking help", "a wise elder with twinkling eyes", "a young creature in need of assistance"],
    emotion: ["excitement", "wonder", "determination", "compassion", "curiosity"],
    magical_element: ["a singing fountain", "trees that glow with inner light", "floating stones that form stepping stones", "flowers that change color with emotions"],
    fantasy_creature: ["a talking fox with silver fur", "a gentle giant made of living stone", "a wise dragon no bigger than a cat", "a fairy with rainbow wings"],
    wisdom_or_challenge: ["ancient riddles that hold great wisdom", "a quest that could help many others", "songs that reveal hidden truths", "a challenge that will test their courage"],
    magical_location: ["Whispering Library", "Crystal Garden", "Starlight Observatory", "Harmony Grove", "Rainbow Falls"],
    clue: ["a mysterious map fragment", "a journal entry in an unknown language", "a peculiar key with no lock in sight", "a painting that seems to move when not watched directly"],
    mystery_element: ["coded message", "hidden passage", "secret compartment", "missing piece of a larger puzzle"],
    revelation: ["the friendly helper has been the one they've been seeking all along", "the mysterious events are all connected", "there's a hidden pattern to everything that's happened"]
  };
  
  // Select random content
  const randomSelect = (array: string[]) => array[Math.floor(Math.random() * array.length)];
  
  // Get appropriate template
  const genreTemplates = storyTemplates[genre as keyof typeof storyTemplates] || storyTemplates.adventure;
  const template = randomSelect(genreTemplates);
  
  // Replace placeholders with dynamic content
  let content = template
    .replace(/{personality_trait}/g, personality)
    .replace(/{location}/g, randomSelect(contentPools.location))
    .replace(/{atmosphere}/g, randomSelect(contentPools.atmosphere))
    .replace(/{discovery}/g, randomSelect(contentPools.discovery))
    .replace(/{branches}/g, randomSelect(contentPools.branches))
    .replace(/{past_experience}/g, randomSelect(contentPools.past_experience))
    .replace(/{character_encounter}/g, randomSelect(contentPools.character_encounter))
    .replace(/{emotion}/g, randomSelect(contentPools.emotion))
    .replace(/{magical_element}/g, randomSelect(contentPools.magical_element))
    .replace(/{fantasy_creature}/g, randomSelect(contentPools.fantasy_creature))
    .replace(/{wisdom_or_challenge}/g, randomSelect(contentPools.wisdom_or_challenge))
    .replace(/{magical_location}/g, randomSelect(contentPools.magical_location))
    .replace(/{clue}/g, randomSelect(contentPools.clue))
    .replace(/{mystery_element}/g, randomSelect(contentPools.mystery_element))
    .replace(/{revelation}/g, randomSelect(contentPools.revelation));
  
  // Add context from previous choices and content
  if (previousChoice) {
    content += ` Following their choice to ${previousChoice.toLowerCase()}, ${characterName} feels more confident in their abilities.`;
  }
  
  // Add continuation based on chapter number
  if (chapterNumber > 1) {
    const continuations = [
      ` This new development builds on everything they've learned so far.`,
      ` Each step of their journey has prepared them for this moment.`,
      ` The adventure grows more exciting with every discovery.`,
      ` Their growing experience helps them navigate these new challenges.`
    ];
    content += randomSelect(continuations);
  }
  
  // Generate appropriate choices if needed
  const choices = shouldIncludeChoices ? generateChoices(characterType, personality, genre) : undefined;
  
  return {
    content: `Chapter ${chapterNumber}: ${content}`,
    ...(choices && { choices })
  };
}

// Generate contextual choices based on character and genre
function generateChoices(characterType: string, personality: string, genre: string) {
  const choiceTemplates = {
    adventure: [
      {
        optionA: { text: "Take the brave path", description: "Face the challenge head-on with courage", statChanges: { courage: 8, strength: 3 } },
        optionB: { text: "Help others first", description: "Look for ways to assist those in need", statChanges: { kindness: 8, friendship: 3 } }
      },
      {
        optionA: { text: "Explore the unknown", description: "Venture into mysterious new territory", statChanges: { courage: 6, creativity: 5 } },
        optionB: { text: "Study the situation", description: "Take time to understand before acting", statChanges: { wisdom: 8, creativity: 2 } }
      }
    ],
    fantasy: [
      {
        optionA: { text: "Use magic wisely", description: "Apply magical knowledge with careful thought", statChanges: { wisdom: 8, creativity: 3 } },
        optionB: { text: "Trust your heart", description: "Let intuition and kindness guide the way", statChanges: { kindness: 8, friendship: 3 } }
      },
      {
        optionA: { text: "Seek ancient wisdom", description: "Learn from the magical world's secrets", statChanges: { wisdom: 7, creativity: 4 } },
        optionB: { text: "Make new allies", description: "Build friendships with magical creatures", statChanges: { friendship: 8, kindness: 3 } }
      }
    ],
    mystery: [
      {
        optionA: { text: "Investigate carefully", description: "Look for clues with patience and skill", statChanges: { wisdom: 8, creativity: 3 } },
        optionB: { text: "Ask for help", description: "Work with others to solve the puzzle", statChanges: { friendship: 8, kindness: 3 } }
      },
      {
        optionA: { text: "Think creatively", description: "Approach the mystery from a new angle", statChanges: { creativity: 8, wisdom: 3 } },
        optionB: { text: "Stay determined", description: "Keep pushing forward despite obstacles", statChanges: { courage: 7, strength: 4 } }
      }
    ]
  };
  
  const genreChoices = choiceTemplates[genre as keyof typeof choiceTemplates] || choiceTemplates.adventure;
  const selectedChoice = genreChoices[Math.floor(Math.random() * genreChoices.length)];
  
  return {
    optionA: {
      text: selectedChoice.optionA.text,
      description: selectedChoice.optionA.description,
      statChanges: {
        courage: selectedChoice.optionA.statChanges.courage || 0,
        kindness: selectedChoice.optionA.statChanges.kindness || 0,
        wisdom: selectedChoice.optionA.statChanges.wisdom || 0,
        creativity: selectedChoice.optionA.statChanges.creativity || 0,
        strength: selectedChoice.optionA.statChanges.strength || 0,
        friendship: selectedChoice.optionA.statChanges.friendship || 0
      }
    },
    optionB: {
      text: selectedChoice.optionB.text,
      description: selectedChoice.optionB.description,
      statChanges: {
        courage: selectedChoice.optionB.statChanges.courage || 0,
        kindness: selectedChoice.optionB.statChanges.kindness || 0,
        wisdom: selectedChoice.optionB.statChanges.wisdom || 0,
        creativity: selectedChoice.optionB.statChanges.creativity || 0,
        strength: selectedChoice.optionB.statChanges.strength || 0,
        friendship: selectedChoice.optionB.statChanges.friendship || 0
      }
    }
  };
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