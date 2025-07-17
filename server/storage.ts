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
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Character operations
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;
  updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined>;
  
  // Story chapter operations
  createStoryChapter(chapter: InsertStoryChapter): Promise<StoryChapter>;
  getChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined>;
  getStoryChapters(storyId: number): Promise<StoryChapter[]>;
  updateChapter(id: number, updates: Partial<StoryChapter>): Promise<StoryChapter | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db
      .insert(characters)
      .values(insertCharacter)
      .returning();
    return character;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));
    return character;
  }

  async getAllCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const [character] = await db
      .update(characters)
      .set(updates)
      .where(eq(characters.id, id))
      .returning();
    return character;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db
      .insert(stories)
      .values(insertStory)
      .returning();
    return story;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, id));
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return await db.select().from(stories);
  }

  async updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined> {
    const [story] = await db
      .update(stories)
      .set(updates)
      .where(eq(stories.id, id))
      .returning();
    return story;
  }

  async createStoryChapter(insertChapter: InsertStoryChapter): Promise<StoryChapter> {
    const [chapter] = await db
      .insert(storyChapters)
      .values(insertChapter)
      .returning();
    return chapter;
  }

  async getChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined> {
    const [chapter] = await db
      .select()
      .from(storyChapters)
      .where(and(
        eq(storyChapters.storyId, storyId),
        eq(storyChapters.chapterNumber, chapterNumber)
      ));
    return chapter;
  }

  async getStoryChapters(storyId: number): Promise<StoryChapter[]> {
    return await db
      .select()
      .from(storyChapters)
      .where(eq(storyChapters.storyId, storyId))
      .orderBy(storyChapters.chapterNumber);
  }

  async updateChapter(id: number, updates: Partial<StoryChapter>): Promise<StoryChapter | undefined> {
    const [chapter] = await db
      .update(storyChapters)
      .set(updates)
      .where(eq(storyChapters.id, id))
      .returning();
    return chapter;
  }
}

export const storage = new DatabaseStorage();
