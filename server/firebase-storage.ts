import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { type User, type Character, type Story, type StoryChapter } from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;

  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: Omit<Character, 'id'>): Promise<Character>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;

  // Story operations
  getAllStories(): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: Omit<Story, 'id'>): Promise<Story>;
  updateStory(id: string, updates: Partial<Story>): Promise<Story>;
  deleteStory(id: string): Promise<void>;

  // Chapter operations
  getStoryChapters(storyId: string): Promise<StoryChapter[]>;
  getChapter(storyId: string, chapterNumber: number): Promise<StoryChapter | undefined>;
  createChapter(chapter: Omit<StoryChapter, 'id'>): Promise<StoryChapter>;
  updateChapter(id: string, updates: Partial<StoryChapter>): Promise<StoryChapter>;
}

export class FirebaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const docRef = await addDoc(collection(db, 'users'), user);
      return { id: docRef.id, ...user } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'characters'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Character[];
    } catch (error) {
      console.error('Error getting characters:', error);
      return [];
    }
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    try {
      const docRef = doc(db, 'characters', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Character;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting character:', error);
      return undefined;
    }
  }

  async createCharacter(character: Omit<Character, 'id'>): Promise<Character> {
    try {
      const docRef = await addDoc(collection(db, 'characters'), character);
      return { id: docRef.id, ...character } as Character;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    try {
      const docRef = doc(db, 'characters', id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Character;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'characters', id));
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }

  // Story operations
  async getAllStories(): Promise<Story[]> {
    try {
      const q = query(collection(db, 'stories'), orderBy('id', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Story[];
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  async getStory(id: string): Promise<Story | undefined> {
    try {
      const docRef = doc(db, 'stories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Story;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting story:', error);
      return undefined;
    }
  }

  async createStory(story: Omit<Story, 'id'>): Promise<Story> {
    try {
      const docRef = await addDoc(collection(db, 'stories'), story);
      return { id: docRef.id, ...story } as Story;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async updateStory(id: string, updates: Partial<Story>): Promise<Story> {
    try {
      const docRef = doc(db, 'stories', id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Story;
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  }

  async deleteStory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'stories', id));
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  // Chapter operations
  async getStoryChapters(storyId: string): Promise<StoryChapter[]> {
    try {
      const q = query(
        collection(db, 'chapters'), 
        where('storyId', '==', storyId), 
        orderBy('chapterNumber', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryChapter[];
    } catch (error) {
      console.error('Error getting story chapters:', error);
      return [];
    }
  }

  async getChapter(storyId: string, chapterNumber: number): Promise<StoryChapter | undefined> {
    try {
      const q = query(
        collection(db, 'chapters'), 
        where('storyId', '==', storyId), 
        where('chapterNumber', '==', chapterNumber)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as StoryChapter;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting chapter:', error);
      return undefined;
    }
  }

  async createChapter(chapter: Omit<StoryChapter, 'id'>): Promise<StoryChapter> {
    try {
      const docRef = await addDoc(collection(db, 'chapters'), chapter);
      return { id: docRef.id, ...chapter } as StoryChapter;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }

  async updateChapter(id: string, updates: Partial<StoryChapter>): Promise<StoryChapter> {
    try {
      const docRef = doc(db, 'chapters', id);
      await updateDoc(docRef, updates);
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as StoryChapter;
    } catch (error) {
      console.error('Error updating chapter:', error);
      throw error;
    }
  }
}

export const storage = new FirebaseStorage();