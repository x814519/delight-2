import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
 

  apiKey: "AIzaSyDaPrwZKEsKDMZAW-iGF6l1YfKoairDEt4",
  authDomain: "delight-sprite.firebaseapp.com",
  projectId: "delight-sprite",
  storageBucket: "delight-sprite.firebasestorage.app",
  messagingSenderId: "1084703954513",
  appId: "1:1084703954513:web:aacccf6e336fb5a930ca70",
  measurementId: "G-7RB397E4X3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Flag to track if admin creation has been attempted
let adminCreationAttempted = false;

// Create admin user
export const createAdminUser = async () => {
  // Skip if already attempted in this session
  if (adminCreationAttempted) {
    return;
  }
  
  adminCreationAttempted = true;
  
  try {
    const adminEmail = "mdziq962#@gmail.com";
    const adminPassword = "@zahidiq1MdX";
    
    // First try to sign in with admin credentials
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      // Check if admin document exists in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (!adminDoc.exists()) {
        // Create admin document if it doesn't exist
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          email: adminEmail,
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }
      
      // Sign out after setup
      await auth.signOut();
      return;
    } catch (signInError) {
      // If sign in fails, create new admin user
      if (signInError.code === 'auth/user-not-found') {
        const newAdminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        
        // Create admin document in Firestore
        await setDoc(doc(db, 'admins', newAdminCredential.user.uid), {
          email: adminEmail,
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        
        // Sign out after setup
        await auth.signOut();
        console.log("Admin user created successfully");
      } else {
        throw signInError;
      }
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // This case should be handled by the sign in attempt above
      console.log("Admin user already exists");
    } else {
      console.error("Error in admin setup:", error);
    }
  }
}; 
