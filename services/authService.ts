import { UserProfile } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export const authService = {
  // Save a new user
  register: async (user: UserProfile): Promise<UserProfile> => {
    try {
      await setDoc(doc(db, "users", user.phone), user);
      return user;
    } catch (e) {
      console.warn("Registration to DB failed, using local session only.");
      return user;
    }
  },

  // Find user by phone (or admin email) and password
  login: async (identifier: string, password: string): Promise<UserProfile | null> => {
    // Admin Check (Hidden credentials)
    if (identifier === 'admin@uncle.com' && password === '00000000') {
        return {
            id: 'admin',
            name: 'المدير العام',
            phone: '00000000',
            hasProfile: true,
            isAdmin: true,
            age: '', gender: '', height: '', weight: '', goal: '', allergies: ''
        };
    }

    // Regular User Login (Firestore lookup by phone)
    try {
      const docRef = doc(db, "users", identifier);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        if (userData.password === password) {
            return userData;
        }
      }
      return null;
    } catch (e) {
      console.warn("Login failed due to DB error or invalid credentials");
      return null;
    }
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      return users;
    } catch (e) {
        console.warn("Failed to fetch users list");
        return [];
    }
  }
};