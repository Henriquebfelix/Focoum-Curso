import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'synced' | 'syncing' | 'offline'

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Usuário FocoUm',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isAnonymous: false
          });
          setSyncStatus('synced');
        } else {
          setUser(null);
          setSyncStatus('offline');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Check for saved local mock demo session
      const savedMockUser = localStorage.getItem('focoum_mock_user');
      if (savedMockUser) {
        try {
          setUser(JSON.parse(savedMockUser));
          setSyncStatus('synced');
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const loggedUser = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Usuário FocoUm',
          email: result.user.email,
          photoURL: result.user.photoURL,
          isAnonymous: false
        };
        setUser(loggedUser);
        setSyncStatus('synced');
        return loggedUser;
      } catch (error) {
        console.error('[FocoUm] Erro no login com Google:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated Demo Login for testing prior to Firebase Console setup
      const demoUser = {
        uid: 'user-google-demo',
        displayName: 'Henrique Demo (Google)',
        email: 'henrique@exemplo.com',
        photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmxgpJr8y_7Dy8458d9OWoIzCBHpgLXdglcdPF47SC_LS0Sog54a6pJ9RoKMNV8yVfIAwWD2h7ydWTVTZZO5m2_IuZdffX0sMAgpHnx8RRcGEHW8K-uOHnHNBmh924goUiESFwSlnSAvIAHPWK0gM49hfs0GMiosEiijswRM9iHFeByn3uaLy-HNOPVgMVQqYgp5volI3enupjL67USwh_AlXZdS_rBYyvMBMQMOFgbK6BSpMz93EQ',
        isDemo: true
      };
      localStorage.setItem('focoum_mock_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setSyncStatus('synced');
      setLoading(false);
      return demoUser;
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('[FocoUm] Erro ao deslogar:', error);
      }
    } else {
      localStorage.removeItem('focoum_mock_user');
    }
    setUser(null);
    setSyncStatus('offline');
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        setSyncStatus,
        isConfigured: isFirebaseConfigured,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
