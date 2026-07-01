import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { dbService } from '../../services/dbService';
import { UserMockDB } from '../users/user.mock';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User as MockUser } from '../users/user.model';

// Unify the user type to support both Firebase and Mock user data
export type AppUser = FirebaseUser | MockUser | null;

interface AuthContextType {
  user: AppUser;
  login: (providerId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser>(null);

  useEffect(() => {
    // If using the mock DB, check if we have a persisted mock user session
    if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
      const savedUserId = sessionStorage.getItem('mockUserId');
      if (savedUserId) {
         const mockUser = UserMockDB.findById(savedUserId);
         if (mockUser) setUser(mockUser);
      }
      return; 
    }

    // Subscribe to Firebase auth state
    let userUnsubscribe: (() => void) | undefined;
    
    const authUnsubscribe = dbService.afUser((firebaseUser) => {
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = undefined;
      }

      if (firebaseUser) {
        // Stream the user profile from Firestore, fallback to firebaseUser if it doesn't exist yet
        userUnsubscribe = dbService.streamEntity<MockUser>('users', firebaseUser.uid, (dbUser) => {
          setUser(dbUser || firebaseUser);
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const login = async (providerId: string) => {
    if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
      // Mock login: automatically log them in using User 1 (Chris)
      const mockUser = UserMockDB.findById('1');
      if (mockUser) {
        setUser(mockUser);
        sessionStorage.setItem('mockUserId', mockUser.__id);
        console.log('Logged in automatically with Mock User:', mockUser);
      }
    } else {
      const result = await dbService.login(providerId);
      if (result && result.user) {
         // Check if user already exists in the database
         const existingUser = await dbService.getEntity<MockUser>('users', result.user.uid);
         if (!existingUser) {
            // Add user to database if it's their first time logging in
            await dbService.addEntity('users', {
               __id: result.user.uid,
               name: result.user.displayName || 'Anonymous',
               email: result.user.email || '',
            });
         }
      }
    }
  };

  const logout = async () => {
    if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
      setUser(null);
      sessionStorage.removeItem('mockUserId');
    } else {
      await dbService.logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
};
