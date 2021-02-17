import React, {useState, useEffect, useContext, createContext} from 'react';
import firebaseClient from '../config/firebase-client.js';

export const FirebaseAuthContext = createContext();

// eslint-disable-next-line react/prop-types
const FirebaseAuthProvider = ({children}) => {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSetUser = user => {
		if (!user) {
			return setUser(null);
		}

		const {uid, displayName, email, photoURL} = user;
		setUser({uid, displayName, email, photoURL});
	};

	const signIn = async (email, password) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await firebaseClient
				.auth()
				.signInWithEmailAndPassword(email, password);

			return handleSetUser(response.user);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await firebaseClient.auth().signOut();

			return handleSetUser(null);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const unsubscriber = firebaseClient.auth().onAuthStateChanged(async user => {
			setIsLoading(true);
			setError(null);

			try {
				if (!user) {
					return handleSetUser(null);
				}

				return handleSetUser(user);
			} catch (error) {
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		});

		return () => unsubscriber();
	}, []);

	return (
		<FirebaseAuthContext.Provider value={{user, error, signIn, signOut, isLoading}}>
			{children}
		</FirebaseAuthContext.Provider>
	);
};

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

export default FirebaseAuthProvider;
