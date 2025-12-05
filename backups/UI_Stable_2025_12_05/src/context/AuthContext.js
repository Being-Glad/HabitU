import React, { createContext, useContext, useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = guest, object = logged in
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const savedUser = await AsyncStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setLoading(false);
        }
    };

    const updateUsername = async (username) => {
        if (!user) return;

        const updatedUser = { ...user, username };
        setUser(updatedUser);
        try {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            // Sync to Firestore
            if (user.id && !user.isGuest) {
                updateStats({ username });
            }
        } catch (e) {
            console.error('Failed to save user', e);
        }
    };

    const [rivals, setRivals] = useState([]);

    useEffect(() => {
        loadUser();
        loadRivals();
    }, []);

    const loadRivals = async () => {
        try {
            const savedRivals = await AsyncStorage.getItem('rivals');
            if (savedRivals) {
                setRivals(JSON.parse(savedRivals));
            }
        } catch (e) {
            console.error('Failed to load rivals', e);
        }
    };

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '311092351994-5hds1vevcap6f1k2fucqd6vvttl9jdbn.apps.googleusercontent.com', // From google-services.json (oauth_client type 3)
        });

        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    const onAuthStateChanged = async (firebaseUser) => {
        if (firebaseUser) {
            // User is signed in
            const userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                photoUrl: firebaseUser.photoURL,
                username: user?.username || null, // Preserve username if already set locally
            };
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } else {
            // User is signed out of Firebase
            // Check if we have a local Guest session before wiping
            const savedUserStr = await AsyncStorage.getItem('user');
            const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

            if (savedUser && savedUser.isGuest) {
                // Keep the guest session alive
                if (!user) setUser(savedUser);
            } else {
                // Really logged out
                setUser(null);
                await AsyncStorage.removeItem('user');
            }
        }
        if (loading) setLoading(false);
    };

    const loginAsGuest = async () => {
        const guestUser = {
            id: 'guest_' + Date.now(),
            name: 'Guest',
            username: null, // Set to null to trigger UsernameSetupScreen
            isGuest: true,
        };
        setUser(guestUser);
        await AsyncStorage.setItem('user', JSON.stringify(guestUser));
    };

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '311092351994-5hds1vevcap6f1k2fucqd6vvttl9jdbn.apps.googleusercontent.com',
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            scopes: ['profile', 'email'],
        });
    }, []);

    const login = async () => {
        try {
            console.log('Starting Google Sign-In flow...');

            // Check Play Services
            try {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                console.log('Play Services available.');
            } catch (err) {
                console.error('Play Services Check Failed', err);
                throw err;
            }

            // Sign In
            console.log('Calling GoogleSignin.signIn()...');
            const response = await GoogleSignin.signIn();
            console.log('Google Sign-In response:', JSON.stringify(response, null, 2));

            if (!response) {
                throw new Error('Google Sign-In returned null response');
            }

            // Handle cancellation
            if (response.type === 'cancelled') {
                console.log('User cancelled the login flow');
                return; // Exit gracefully
            }

            // Handle v16+ structure where data might be nested
            const userInfo = response.data || response;
            const idToken = userInfo.idToken;

            if (!idToken) {
                console.error('Missing idToken in response:', response);
                throw new Error('Google Sign-In returned null idToken');
            }

            // Firebase Credential
            console.log('Creating Firebase credential...');
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Firebase Sign In
            console.log('Signing in to Firebase...');
            const userCredential = await auth().signInWithCredential(googleCredential);
            console.log('Firebase Sign-In successful.');

            // Fetch user profile from Firestore to get username
            const uid = userCredential.user.uid;
            const userDoc = await firestore().collection('users').doc(uid).get();

            let fetchedUsername = null;
            if (userDoc.exists) {
                const userData = userDoc.data();
                fetchedUsername = userData.username || null;
            }

            // Update local user state. 
            // Set username to null to force UsernameSetupScreen, but pass suggestedUsername for pre-fill.
            const userData = {
                id: uid,
                email: userCredential.user.email,
                name: userCredential.user.displayName,
                photoUrl: userCredential.user.photoURL,
                username: null,
                suggestedUsername: fetchedUsername,
                isGuest: false
            };
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

        } catch (error) {
            console.error('Google Sign-In Error', error);

            // Safe error handling
            const errorCode = error?.code;
            const errorMessage = error?.message;

            if (errorCode === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (errorCode === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress already');
            } else if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.log('Other Error:', errorCode, errorMessage);
            }
        }
    };

    const logout = async () => {
        try {
            if (user?.isGuest) {
                setUser(null);
                await AsyncStorage.removeItem('user');
                return;
            }

            try {
                await auth().signOut();
                await GoogleSignin.signOut();
            } catch (authError) {
                console.log('Firebase/Google signout error (ignoring):', authError);
            }

            setUser(null);
            await AsyncStorage.removeItem('user');
        } catch (e) {
            console.error('Failed to logout', e);
        }
    };

    // --- Social Features (Offline) ---

    // Generate a code containing: { id, name, streak }
    // We encode it in Base64 to make it a single string
    const generateShareCode = (currentStreak) => {
        if (!user) return null;
        const data = {
            id: user.id,
            name: user.username || user.name || 'Unknown',
            streak: currentStreak,
            ts: Date.now() // Timestamp to ensure uniqueness/freshness
        };
        try {
            const json = JSON.stringify(data);
            // Simple Base64 encoding (using btoa polyfill or Buffer if needed, but RN has global.btoa in some envs)
            // If btoa is not available, we can use a simple buffer approach or just stringify for now.
            // React Native usually supports btoa/atob in Debug, but let's be safe and use a simple char code shift or just JSON for now if we want to be 100% safe without adding libs.
            // Actually, let's just use JSON stringified and maybe hex encoded for readability?
            // Let's try standard Base64.
            // Use Buffer for robust UTF-8 support
            const base64 = Buffer.from(json).toString('base64');
            return base64;
        } catch (e) {
            console.error('Failed to generate code', e);
            return null;
        }
    };

    const addRival = async (code) => {
        try {
            // Use Buffer for robust UTF-8 support (atob fails with emojis/unicode)
            const json = Buffer.from(code, 'base64').toString('utf8');

            const data = JSON.parse(json);

            // Basic validation
            if (!data.id || !data.name || typeof data.streak !== 'number') {
                throw new Error('Invalid code format');
            }

            // Check if rival already exists, update if so
            const existingIndex = rivals.findIndex(r => r.id === data.id);
            let newRivals;

            if (existingIndex >= 0) {
                newRivals = [...rivals];
                newRivals[existingIndex] = { ...data, addedAt: new Date().toISOString() };
            } else {
                newRivals = [...rivals, { ...data, addedAt: new Date().toISOString() }];
            }

            setRivals(newRivals);
            await AsyncStorage.setItem('rivals', JSON.stringify(newRivals));
            return { success: true, rival: data };
        } catch (e) {
            console.error('Failed to add rival', e);
            return { success: false, error: 'Invalid Code' };
        }
    };

    const updateStats = async (stats) => {
        if (!user || !user.id || user.isGuest) return;

        try {
            const userRef = firestore().collection('users').doc(user.id);
            await userRef.set({
                ...user,
                ...stats,
                lastActive: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } catch (e) {
            console.error('Failed to update stats', e);
        }
    };

    const removeRival = async (rivalId) => {
        const newRivals = rivals.filter(r => r.id !== rivalId);
        setRivals(newRivals);
        await AsyncStorage.setItem('rivals', JSON.stringify(newRivals));
    };

    return (
        <AuthContext.Provider value={{ user, login, loginAsGuest, logout, updateUsername, loading, rivals, addRival, removeRival, generateShareCode, updateStats }}>
            {children}
        </AuthContext.Provider>
    );
};
