import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, CollectionReference, query, orderBy, onSnapshot, Query, DocumentData, QuerySnapshot, OrderByDirection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, User, onAuthStateChanged, NextOrObserver, signOut } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { firebaseConfig } from "./credential"

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const dbCollection = (name: string) => collection(db, name);
const dbDoc = (col: string, id: string) => doc(db, col, id);
const dbAdd = (ref: CollectionReference, id: string, object: Object) => setDoc(doc(ref, id), object);
const dbEdt = (col: string, id: string, object: any) => updateDoc(doc(db, col, id), object);
const dbDel = (col: string, id: string) => deleteDoc(doc(db, col, id));
const dbOrderBy = (ref: CollectionReference, prop: string, order: OrderByDirection) => query(ref, orderBy(prop, order));
const dbOnSnapshot = (query: Query<unknown, DocumentData>, action: ((snapshot: QuerySnapshot<unknown, DocumentData>) => void)) => onSnapshot(query, action)
const auth = getAuth(app);
const authSignIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
const authOnStateChanged = (callback: NextOrObserver<User>) => onAuthStateChanged(auth, callback)
const authSignOut = (success: (val: any) => void, error?: () => void) => signOut(auth).then(success).catch(error)
const functions = getFunctions(app);

export {dbCollection, dbAdd, dbEdt, dbDel, dbDoc, dbOrderBy, dbOnSnapshot, authSignIn, authOnStateChanged, authSignOut, functions}
