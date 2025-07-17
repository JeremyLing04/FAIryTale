import { integer, pgTable, text, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const characters = pgTable("characters", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  personality: text("personality").notNull(),
  powers: text("powers").array().notNull().default([]),
  stats: json("stats").$type<{
    courage: number;
    intelligence: number;
    kindness: number;
    creativity: number;
    strength: number;
  }>().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  genre: text("genre").notNull(),
  currentChapter: integer("current_chapter").notNull().default(1),
  totalChapters: integer("total_chapters").notNull().default(5),
  isCompleted: boolean("is_completed").notNull().default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyChapters = pgTable("story_chapters", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  storyId: integer("story_id").notNull().references(() => stories.id),
  chapterNumber: integer("chapter_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  choices: json("choices").$type<{
    optionA: { 
      text: string; 
      description: string;
      statEffects?: { [key: string]: number };
    };
    optionB: { 
      text: string; 
      description: string;
      statEffects?: { [key: string]: number };
    };
  } | null>(),
  hasChoices: boolean("has_choices").default(false),
  isGenerated: boolean("is_generated").default(true),
  selectedChoice: text("selected_choice", { enum: ['A', 'B'] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryChapter = typeof storyChapters.$inferSelect;

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
}).extend({
  stats: z.object({
    courage: z.number().min(1).max(10),
    intelligence: z.number().min(1).max(10),
    kindness: z.number().min(1).max(10),
    creativity: z.number().min(1).max(10),
    strength: z.number().min(1).max(10),
  }),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertStoryChapterSchema = createInsertSchema(storyChapters).omit({
  id: true,
  createdAt: true,
}).extend({
  choices: z.object({
    optionA: z.object({
      text: z.string(),
      description: z.string(),
      statEffects: z.record(z.number()).optional(),
    }),
    optionB: z.object({
      text: z.string(),
      description: z.string(),
      statEffects: z.record(z.number()).optional(),
    }),
  }).optional(),
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;
