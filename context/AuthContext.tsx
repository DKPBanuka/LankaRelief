import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '../types';

interface AuthContextType {
    user: User | null;
    appUser: AppUser | null;
    loading: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch or create user in Firestore
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setAppUser(userSnap.data() as AppUser);
                } else {
                    // Create new user with default 'user' role
                    const newUser: AppUser = {
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        displayName: currentUser.displayName || 'User',
                        photoURL: currentUser.photoURL || undefined,
                        role: 'user',
                        createdAt: Date.now()
                    };
                    await setDoc(userRef, newUser);
                    setAppUser(newUser);
                }
            } else {
                setAppUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Login failed", error);
            alert("Login failed: " + error.message);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setAppUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const isAdmin = appUser?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, appUser, loading, isAdmin, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
