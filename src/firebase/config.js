import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'sua-api-key-aqui' &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let functions = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    functions = getFunctions(app);

    console.info('[FocoUm] Firebase conectado com backend Cloud Functions ativo.');
  } catch (error) {
    console.warn('[FocoUm] Falha ao inicializar Firebase Functions:', error);
  }
} else {
  console.info('[FocoUm] Operando em modo Local-First. Configure o arquivo .env para ativar o backend Cloud Functions.');
}

export { app, auth, functions, googleProvider };
