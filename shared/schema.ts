import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // custom or predefined types
  personality: text("personality").notNull(),
  powers: text("powers").array().default([]),
  imageUrl: text("image_url"), // character image upload
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(), // "adventure", "fantasy", "mystery", etc.
  characterId: integer("character_id").references(() => characters.id),
  currentChapter: integer("current_chapter").default(1),
  totalChapters: integer("total_chapters").default(5),
  isCompleted: boolean("is_completed").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyChapters = pgTable("story_chapters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id),
  chapterNumber: integer("chapter_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  choices: json("choices").$type<{
    optionA: {
      text: string;
      description: string;
      nextChapter?: number;
    };
    optionB: {
      text: string;
      description: string;
      nextChapter?: number;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertStoryChapterSchema = createInsertSchema(storyChapters).omit({
  id: true,
  createdAt: true,
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryChapter = typeof storyChapters.$inferSelect;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;
