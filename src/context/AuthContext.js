import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // User roles
  const USER_ROLES = {
    ADMIN: 'admin',
    INSTITUTE: 'institute',
    STUDENT: 'student',
    COMPANY: 'company'
  };

  // Register user with role
  const register = async (email, password, userData, role) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Send email verification
      await sendEmailVerification(user);

      // Save user data to Firestore
      // Companies require admin approval, others are active after email verification
      const userStatus = role === 'company' ? 'pending' : 'active';
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: role,
        createdAt: new Date(),
        emailVerified: false,
        status: userStatus,
        ...userData
      });

      if (role === 'company') {
        toast.success('Registration successful! Please verify your email and wait for admin approval before logging in.');
      } else {
        toast.success('Registration successful! Please check your email to verify your account before logging in.');
      }
      return { user, role };
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('Firebase user:', user); // Debug
      
      // Check email verification - TEMPORARILY DISABLED FOR TESTING
      // TODO: Re-enable before final submission
      // if (!user.emailVerified) {
      //   toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
      //   await signOut(auth);
      //   return null;
      // }

      // Get user role and data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('User document exists:', userDoc.exists()); // Debug
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData); // Debug
        
        // Check account status (important for company approval)
        if (userData.status === 'pending') {
          toast.error('Your account is pending approval. Please wait for admin approval.');
          await signOut(auth);
          return null;
        }
        
        if (userData.status === 'rejected' || userData.status === 'suspended') {
          toast.error('Your account has been ' + userData.status + '. Please contact support.');
          await signOut(auth);
          return null;
        }
        
        // Update email verified status in Firestore if not already updated
        if (!userData.emailVerified && user.emailVerified) {
          await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            emailVerified: true
          }, { merge: true });
        }
        
        // Set the role immediately
        setUserRole(userData.role);
        setCurrentUser(user);
        
        console.log('Login successful, role:', userData.role); // Debug
        toast.success('Login successful!');
        return { user, role: userData.role };
      } else {
        console.error('User document not found in Firestore'); // Debug
        toast.error('User data not found. Please register first.');
        await signOut(auth);
        return null;
      }
    } catch (error) {
      console.error('Login error:', error); // Debug
      toast.error('Invalid email or password');
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Get user data
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      toast.error('Failed to fetch user data. Please try again.');
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
          setCurrentUser(user);
          setUserRole(userData.role);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    USER_ROLES,
    register,
    login,
    logout,
    getUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};