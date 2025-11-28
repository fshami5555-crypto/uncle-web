import { UserProfile } from '../types';

const STORAGE_KEY = 'uh_users';

export const authService = {
  // Save a new user
  register: (user: UserProfile) => {
    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Check if phone already exists
    const existingIndex = users.findIndex(u => u.phone === user.phone);
    if (existingIndex > -1) {
       // Update existing
       users[existingIndex] = user;
    } else {
       // Add new
       users.push(user);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return user;
  },

  // Find user by phone and password
  login: (phone: string, password: string): UserProfile | null => {
    // Admin Check
    if (phone === '00000000' && password === '00000000') {
        return {
            id: 'admin',
            name: 'المدير العام',
            phone: '00000000',
            hasProfile: true,
            isAdmin: true,
            // Default empty fields to satisfy type
            age: '', gender: '', height: '', weight: '', goal: '', allergies: ''
        };
    }

    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.phone === phone && u.password === password);
    return user || null;
  },

  // Check if phone exists (for simple validation)
  userExists: (phone: string): boolean => {
    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users: UserProfile[] = usersStr ? JSON.parse(usersStr) : [];
    return users.some(u => u.phone === phone);
  },

  getAllUsers: (): UserProfile[] => {
    const usersStr = localStorage.getItem(STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }
};
