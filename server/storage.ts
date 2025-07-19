import { 
  type Character, 
  type InsertCharacter,
  type Story,
  type InsertStory,
  type StoryChapter,
  type InsertStoryChapter
} from "@shared/schema";

export interface IStorage {
  // Character operations
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;
  updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;
  
  // Story chapter operations
  createStoryChapter(chapter: InsertStoryChapter): Promise<StoryChapter>;
  getStoryChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined>;
  getStoryChapters(storyId: number): Promise<StoryChapter[]>;
}

export class MemStorage implements IStorage {
  private characters: Map<number, Character> = new Map();
  private stories: Map<number, Story> = new Map();
  private storyChapters: Map<string, StoryChapter> = new Map();
  private currentCharacterId = 1;
  private currentStoryId = 1;
  private currentChapterId = 1;

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const character: Character = {
      ...insertCharacter,
      id: this.currentCharacterId++,
      createdAt: new Date(),
    };
    this.characters.set(character.id, character);
    return character;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const story: Story = {
      ...insertStory,
      id: this.currentStoryId++,
      createdAt: new Date(),
    };
    this.stories.set(story.id, story);
    return story;
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getAllStories(): Promise<Story[]> {
    return Array.from(this.stories.values());
  }

  async updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;
    
    const updatedStory = { ...story, ...updates };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async createStoryChapter(insertChapter: InsertStoryChapter): Promise<StoryChapter> {
    const chapter: StoryChapter = {
      ...insertChapter,
      id: this.currentChapterId++,
      createdAt: new Date(),
    };
    const key = `${chapter.storyId}-${chapter.chapterNumber}`;
    this.storyChapters.set(key, chapter);
    return chapter;
  }

  async getStoryChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined> {
    const key = `${storyId}-${chapterNumber}`;
    return this.storyChapters.get(key);
  }

  async getStoryChapters(storyId: number): Promise<StoryChapter[]> {
    return Array.from(this.storyChapters.values())
      .filter(chapter => chapter.storyId === storyId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  async deleteStory(id: number): Promise<boolean> {
    // Delete the story
    const deleted = this.stories.delete(id);
    
    // Delete all chapters for this story
    const chaptersToDelete = Array.from(this.storyChapters.entries())
      .filter(([key, chapter]) => chapter.storyId === id)
      .map(([key]) => key);
    
    chaptersToDelete.forEach(key => this.storyChapters.delete(key));
    
    return deleted;
  }
}

export const storage = new MemStorage();
