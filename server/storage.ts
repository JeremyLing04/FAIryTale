import { 
  characters, 
  stories, 
  storyChapters,
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
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;
  updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined>;
  
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
}

import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters).values(insertCharacter).returning();
    return character;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async getAllCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db.insert(stories).values(insertStory).returning();
    return story;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || undefined;
  }

  async getAllStories(): Promise<Story[]> {
    return await db.select().from(stories);
  }

  async updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined> {
    const [story] = await db.update(stories)
      .set(updates)
      .where(eq(stories.id, id))
      .returning();
    return story || undefined;
  }

  async createStoryChapter(insertChapter: InsertStoryChapter): Promise<StoryChapter> {
    const [chapter] = await db.insert(storyChapters).values(insertChapter).returning();
    return chapter;
  }

  async getStoryChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined> {
    const [chapter] = await db.select()
      .from(storyChapters)
      .where(and(
        eq(storyChapters.storyId, storyId),
        eq(storyChapters.chapterNumber, chapterNumber)
      ));
    return chapter || undefined;
  }

  async getStoryChapters(storyId: number): Promise<StoryChapter[]> {
    return await db.select()
      .from(storyChapters)
      .where(eq(storyChapters.storyId, storyId))
      .orderBy(asc(storyChapters.chapterNumber));
  }
}

// Storage factory function
async function createStorage(): Promise<IStorage> {
  const useFirebase = process.env.USE_FIREBASE === 'true';
  
  if (useFirebase) {
    try {
      const { FirebaseStorage } = await import('./firebase-storage');
      console.log('✓ Using Firebase storage');
      return new FirebaseStorage();
    } catch (error) {
      console.error('Failed to initialize Firebase storage:', error);
      console.log('Falling back to Database storage');
      return new DatabaseStorage();
    }
  } else {
    console.log('✓ Using Database storage');
    return new DatabaseStorage();
  }
}

// Export storage promise
export const storage = await createStorage();
