'use client'

// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

// Create context with default values
const AuthContext = createContext({
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Starting initialization');
    
    // Verify auth is initialized
    const currentAuth = getAuth();
    if (!currentAuth) {
      console.error('AuthProvider: Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(currentAuth, async (firebaseUser) => {
      console.log('AuthProvider: Auth state changed:', {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email
      });

      if (firebaseUser) {
        try {
          // Force token refresh to ensure valid session
          await firebaseUser.getIdToken(true);
          
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email
          };
          
          console.log('AuthProvider: Setting authenticated user:', userData);
          setUser(userData);
        } catch (error) {
          console.error('AuthProvider: Error refreshing token:', error);
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No user found');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    // Add signOut function
    signOut: async () => {
      try {
        await auth.signOut();
        setUser(null);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook with safety check
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
