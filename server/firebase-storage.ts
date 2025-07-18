import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Character, Story, StoryChapter, InsertCharacter, InsertStory, InsertStoryChapter } from '@shared/schema';
import type { IStorage } from './storage';

export class FirebaseStorage implements IStorage {
  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    const charactersRef = collection(db, 'characters');
    const snapshot = await getDocs(charactersRef);
    return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Character));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const characterRef = doc(db, 'characters', id.toString());
    const snapshot = await getDoc(characterRef);
    return snapshot.exists() ? { id, ...snapshot.data() } as Character : undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const charactersRef = collection(db, 'characters');
    const docRef = await addDoc(charactersRef, {
      ...character,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...character } as Character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const characterRef = doc(db, 'characters', id.toString());
    await updateDoc(characterRef, updates);
    return this.getCharacter(id);
  }

  async deleteCharacter(id: number): Promise<void> {
    const characterRef = doc(db, 'characters', id.toString());
    await deleteDoc(characterRef);
  }

  // Story operations
  async getAllStories(): Promise<Story[]> {
    const storiesRef = collection(db, 'stories');
    const snapshot = await getDocs(query(storiesRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Story));
  }

  async getStory(id: number): Promise<Story | undefined> {
    const storyRef = doc(db, 'stories', id.toString());
    const snapshot = await getDoc(storyRef);
    return snapshot.exists() ? { id, ...snapshot.data() } as Story : undefined;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const storiesRef = collection(db, 'stories');
    const docRef = await addDoc(storiesRef, {
      ...story,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...story } as Story;
  }

  async updateStory(id: number, updates: Partial<Story>): Promise<Story | undefined> {
    const storyRef = doc(db, 'stories', id.toString());
    await updateDoc(storyRef, updates);
    return this.getStory(id);
  }

  async deleteStory(id: number): Promise<void> {
    const storyRef = doc(db, 'stories', id.toString());
    await deleteDoc(storyRef);
  }

  // Story chapter operations
  async getStoryChapters(storyId: number): Promise<StoryChapter[]> {
    const chaptersRef = collection(db, 'story_chapters');
    const snapshot = await getDocs(
      query(chaptersRef, 
        where('storyId', '==', storyId), 
        orderBy('chapterNumber', 'asc')
      )
    );
    return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as StoryChapter));
  }

  async getStoryChapter(id: number): Promise<StoryChapter | undefined> {
    const chapterRef = doc(db, 'story_chapters', id.toString());
    const snapshot = await getDoc(chapterRef);
    return snapshot.exists() ? { id, ...snapshot.data() } as StoryChapter : undefined;
  }

  async createStoryChapter(chapter: InsertStoryChapter): Promise<StoryChapter> {
    const chaptersRef = collection(db, 'story_chapters');
    const docRef = await addDoc(chaptersRef, {
      ...chapter,
      createdAt: new Date()
    });
    return { id: parseInt(docRef.id), ...chapter } as StoryChapter;
  }

  async getStoryChapter(storyId: number, chapterNumber: number): Promise<StoryChapter | undefined> {
    const chaptersRef = collection(db, 'story_chapters');
    const snapshot = await getDocs(
      query(chaptersRef, 
        where('storyId', '==', storyId),
        where('chapterNumber', '==', chapterNumber),
        limit(1)
      )
    );
    return snapshot.docs.length > 0 ? 
      { id: parseInt(snapshot.docs[0].id), ...snapshot.docs[0].data() } as StoryChapter : 
      undefined;
  }

  async updateStoryChapter(id: number, updates: Partial<StoryChapter>): Promise<StoryChapter | undefined> {
    const chapterRef = doc(db, 'story_chapters', id.toString());
    await updateDoc(chapterRef, updates);
    const snapshot = await getDoc(chapterRef);
    return snapshot.exists() ? { id, ...snapshot.data() } as StoryChapter : undefined;
  }

  async deleteStoryChapter(id: number): Promise<void> {
    const chapterRef = doc(db, 'story_chapters', id.toString());
    await deleteDoc(chapterRef);
  }

  // Get latest chapter for a story
  async getLatestChapter(storyId: number): Promise<StoryChapter | undefined> {
    const chaptersRef = collection(db, 'story_chapters');
    const snapshot = await getDocs(
      query(chaptersRef, 
        where('storyId', '==', storyId), 
        orderBy('chapterNumber', 'desc'),
        limit(1)
      )
    );
    return snapshot.docs.length > 0 ? 
      { id: parseInt(snapshot.docs[0].id), ...snapshot.docs[0].data() } as StoryChapter : 
      undefined;
  }
}