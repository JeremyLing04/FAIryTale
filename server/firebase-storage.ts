import { db } from './firebase';
import { type Character, type Story, type StoryChapter, type InsertCharacter, type InsertStory, type InsertStoryChapter } from '@shared/schema';
import { type IStorage } from './storage';

export class FirebaseStorage implements IStorage {
  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    const doc = await db.collection('characters').doc(id.toString()).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    return { id: parseInt(doc.id), ...data } as Character;
  }

  async getAllCharacters(): Promise<Character[]> {
    const snapshot = await db.collection('characters').get();
    return snapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Character));
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const docRef = await db.collection('characters').add({
      ...character,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...character } as Character;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    const doc = await db.collection('stories').doc(id.toString()).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    return { id: parseInt(doc.id), ...data } as Story;
  }

  async getAllStories(): Promise<Story[]> {
    const snapshot = await db.collection('stories').get();
    return snapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Story));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const docRef = await db.collection('stories').add({
      ...story,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...story } as Story;
  }

  async updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined> {
    await db.collection('stories').doc(id.toString()).update(updates);
    return await this.getStory(id);
  }

  // Chapter methods
  async getStoryChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined> {
    const snapshot = await db.collection('chapters')
      .where('storyId', '==', storyId)
      .where('chapterNumber', '==', chapterNumber)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return { id: parseInt(doc.id), ...data } as StoryChapter;
  }

  async getStoryChapters(storyId: number): Promise<StoryChapter[]> {
    const snapshot = await db.collection('chapters')
      .where('storyId', '==', storyId)
      .orderBy('chapterNumber')
      .get();
    
    return snapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as StoryChapter));
  }

  async createStoryChapter(chapter: InsertStoryChapter): Promise<StoryChapter> {
    const docRef = await db.collection('chapters').add({
      ...chapter,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...chapter } as StoryChapter;
  }
}

// Remove the old export since we're now using the IStorage interface