import { z } from "zod";

// Character types and interfaces
export interface Character {
  id: number;
  name: string;
  type: string; // custom or predefined types
  personality: string;
  powers: string[];
  imageUrl?: string; // character image upload
  // Character stats (0-100 scale)
  courage: number;
  kindness: number;
  wisdom: number;
  creativity: number;
  strength: number;
  friendship: number;
  createdAt: Date;
}

export interface Story {
  id: number;
  title: string;
  genre: string; // "adventure", "fantasy", "mystery", etc.
  characterId: number;
  currentChapter: number;
  totalChapters: number;
  isCompleted: boolean;
  imageUrl?: string;
  isShared: boolean; // whether the story is shared with other children
  authorName?: string; // name of the child who created it
  likes: number; // number of likes from other children
  createdAt: Date;
}

export interface StoryChapter {
  id: number;
  storyId: number;
  chapterNumber: number;
  content: string;
  imageUrl?: string;
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
  } | null; // null when no choices available
  hasChoices: boolean;
  isGenerated: boolean; // track if chapter is dynamically generated
  createdAt: Date;
}

// Zod schemas for validation
export const insertCharacterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  personality: z.string().min(1, "Personality is required"),
  powers: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  courage: z.number().min(0).max(100).default(50),
  kindness: z.number().min(0).max(100).default(50),
  wisdom: z.number().min(0).max(100).default(50),
  creativity: z.number().min(0).max(100).default(50),
  strength: z.number().min(0).max(100).default(50),
  friendship: z.number().min(0).max(100).default(50),
});

export const insertStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  characterId: z.number(),
  currentChapter: z.number().default(1),
  totalChapters: z.number().default(5),
  isCompleted: z.boolean().default(false),
  imageUrl: z.string().optional(),
  isShared: z.boolean().default(false),
  authorName: z.string().optional(),
  likes: z.number().default(0),
});

export const insertStoryChapterSchema = z.object({
  storyId: z.number(),
  chapterNumber: z.number(),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  choices: z.object({
    optionA: z.object({
      text: z.string(),
      description: z.string(),
      statChanges: z.object({
        courage: z.number().optional(),
        kindness: z.number().optional(),
        wisdom: z.number().optional(),
        creativity: z.number().optional(),
        strength: z.number().optional(),
        friendship: z.number().optional(),
      }).optional(),
    }),
    optionB: z.object({
      text: z.string(),
      description: z.string(),
      statChanges: z.object({
        courage: z.number().optional(),
        kindness: z.number().optional(),
        wisdom: z.number().optional(),
        creativity: z.number().optional(),
        strength: z.number().optional(),
        friendship: z.number().optional(),
      }).optional(),
    }),
  }).nullable().optional(),
  hasChoices: z.boolean().default(false),
  isGenerated: z.boolean().default(true),
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;
