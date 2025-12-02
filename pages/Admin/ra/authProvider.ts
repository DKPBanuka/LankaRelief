import { AuthProvider } from 'react-admin';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';

export const authProvider: AuthProvider = {
    login: async () => {
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Check if user is admin
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                return Promise.resolve();
            } else {
                await signOut(auth);
                return Promise.reject(new Error('Unauthorized: Admins only'));
            }
        } catch (error: any) {
            return Promise.reject(new Error(error.message));
        }
    },
    logout: async () => {
        await signOut(auth);
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: async () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                unsubscribe();
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            });
        });
    },
    getPermissions: async () => {
        return Promise.resolve('admin');
    },
    getIdentity: () => {
        const user = auth.currentUser;
        if (user) {
            return Promise.resolve({
                id: user.uid,
                fullName: user.displayName || user.email,
                avatar: user.photoURL,
            });
        }
        return Promise.reject();
    }
};
