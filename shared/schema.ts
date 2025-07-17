import { z } from "zod";

// Firebase uses string IDs, so we define types directly
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Character {
  id: string;
  name: string;
  type: string;
  personality: string;
  powers: string[];
  imageUrl?: string;
  createdAt?: string;
}

export interface Story {
  id: string;
  title: string;
  characterId: string;
  genre: string;
  currentChapter: number;
  totalChapters: number;
  isCompleted: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export interface StoryChapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  content: string;
  imageUrl?: string;
  choices?: {
    optionA: { text: string; description: string };
    optionB: { text: string; description: string };
  } | null;
  hasChoices?: boolean;
  isGenerated?: boolean;
  createdAt?: string;
}

// Zod schemas for validation
export const insertCharacterSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  personality: z.string().min(1),
  powers: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
});

export const insertStorySchema = z.object({
  title: z.string().min(1),
  characterId: z.string().min(1),
  genre: z.string().min(1),
  currentChapter: z.number().default(1),
  totalChapters: z.number().default(5),
  isCompleted: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

export const insertStoryChapterSchema = z.object({
  storyId: z.string().min(1),
  chapterNumber: z.number().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  choices: z.object({
    optionA: z.object({
      text: z.string(),
      description: z.string(),
    }),
    optionB: z.object({
      text: z.string(),
      description: z.string(),
    }),
  }).optional(),
  hasChoices: z.boolean().default(false),
  isGenerated: z.boolean().default(true),
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;
