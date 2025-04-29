import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  StorageReference 
} from 'firebase/storage';

// Firebase configuration for Oak Haven Commerce
// These values should be replaced with the actual configuration from Firebase console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "oak-haven-commerce",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Connect to Firebase emulators in development environment
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
  const { connectAuthEmulator } = require('firebase/auth');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  const { connectStorageEmulator } = require('firebase/storage');
  
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  
  console.log('Using Firebase emulators for local development');
}

// Collection references (type-safe)
const usersCollection = collection(db, 'users') as CollectionReference<UserData>;
const productsCollection = collection(db, 'products') as CollectionReference<ProductData>;
const ordersCollection = collection(db, 'orders') as CollectionReference<OrderData>;
const enquiriesCollection = collection(db, 'enquiries') as CollectionReference<EnquiryData>;

// Authentication helper functions
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      addresses: [],
      role: 'customer'
    });
  }
  
  return userCredential;
};

export const loginWithEmail = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const loginWithApple = (): Promise<UserCredential> => {
  return signInWithPopup(auth, appleProvider);
};

export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

export const sendPasswordReset = (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Firestore helper functions
export const createDocument = async <T extends DocumentData>(
  collectionPath: string, 
  data: T, 
  id?: string
): Promise<string> => {
  const collectionRef = collection(db, collectionPath);
  const docRef = id ? doc(collectionRef, id) : doc(collectionRef);
  
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const getDocument = async <T>(
  collectionPath: string, 
  id: string
): Promise<T | null> => {
  const docRef = doc(db, collectionPath, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  } else {
    return null;
  }
};

export const updateDocument = async <T extends DocumentData>(
  collectionPath: string, 
  id: string, 
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionPath, id);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteDocument = async (
  collectionPath: string, 
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
};

// Storage helper functions
export const uploadFile = async (
  path: string, 
  file: File
): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Custom types
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  addresses: Address[];
  role: 'customer' | 'admin';
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  isDefault: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  category: 'garage' | 'gazebo' | 'porch' | 'beam' | 'flooring';
  description: string;
  images: string[];
  options: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderData {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingCost: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  options: Record<string, any>;
}

export interface EnquiryData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  productCategory?: 'garage' | 'gazebo' | 'porch' | 'beam' | 'flooring';
  status: 'new' | 'inProgress' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Export Firebase instances and services
export { 
  app, 
  auth, 
  db, 
  storage,
  usersCollection,
  productsCollection,
  ordersCollection,
  enquiriesCollection,
  serverTimestamp,
  Timestamp
};

export default app;

