import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, 
  insertStorySchema,
  insertStoryChapterSchema 
} from "@shared/schema";
import { generateStoryChapter, generateStoryImage } from "./services/ollama";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Character routes
  app.post("/api/characters", async (req, res) => {
    try {
      const character = insertCharacterSchema.parse(req.body);
      const newCharacter = await storage.createCharacter(character);
      res.json(newCharacter);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  // Story routes
  app.post("/api/stories", async (req, res) => {
    try {
      const story = insertStorySchema.parse(req.body);
      const newStory = await storage.createStory(story);
      res.json(newStory);
    } catch (error) {
      res.status(400).json({ message: "Invalid story data" });
    }
  });

  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStory(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.patch("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedStory = await storage.updateStory(id, updates);
      if (!updatedStory) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(updatedStory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  // Story chapter routes
  app.post("/api/stories/:storyId/chapters", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const chapter = insertStoryChapterSchema.parse({
        ...req.body,
        storyId
      });
      const newChapter = await storage.createStoryChapter(chapter);
      res.json(newChapter);
    } catch (error) {
      res.status(400).json({ message: "Invalid chapter data" });
    }
  });

  app.get("/api/stories/:storyId/chapters/:chapterNumber", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const chapterNumber = parseInt(req.params.chapterNumber);
      const chapter = await storage.getStoryChapter(storyId, chapterNumber);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  app.get("/api/stories/:storyId/chapters", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const chapters = await storage.getStoryChapters(storyId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Dynamic story generation route
  app.post("/api/stories/:storyId/generate-chapter", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const requestSchema = z.object({
        characterName: z.string(),
        characterType: z.string(),
        personality: z.string(),
        genre: z.string(),
        chapterNumber: z.number(),
        previousChoice: z.string().optional(),
        characterImageUrl: z.string().optional(),
      });

      const request = requestSchema.parse(req.body);
      
      // Get story and existing chapters for context
      const story = await storage.getStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      const existingChapters = await storage.getStoryChapters(storyId);
      const previousContent = existingChapters
        .map(ch => ch.content)
        .join('\n\n');
      
      // Generate new chapter with context
      const storyChapter = await generateStoryChapter({
        ...request,
        previousContent,
      });
      
      // Determine if this chapter should have choices (every 2-3 chapters)
      const hasChoices = request.chapterNumber % 3 === 0 && request.chapterNumber < 8;
      
      // Generate image for the chapter
      let imageUrl = null;
      try {
        imageUrl = await generateStoryImage(storyChapter.content, request.characterImageUrl, request.genre);
      } catch (imageError) {
        console.error('Failed to generate image:', imageError);
      }
      
      // Save chapter to database
      const chapterData = {
        storyId,
        chapterNumber: request.chapterNumber,
        content: storyChapter.content,
        choices: hasChoices ? storyChapter.choices : null,
        hasChoices,
        isGenerated: true,
        imageUrl,
      };
      
      const savedChapter = await storage.createStoryChapter(chapterData);
      
      // Update story progress
      await storage.updateStory(storyId, {
        currentChapter: request.chapterNumber,
        totalChapters: Math.max(story.totalChapters || 5, request.chapterNumber + 2),
        isCompleted: request.chapterNumber >= 8,
      });
      
      res.json(savedChapter);
    } catch (error) {
      console.error('Error in generate-chapter:', error);
      res.status(500).json({ message: "Failed to generate story chapter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
