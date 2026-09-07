import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  deleteUser,
  reauthenticateWithPopup,
} from "firebase/auth";
import { db, googleProvider } from "../firebase";
import { COLLECTIONS } from "../config/brand";

function collectionRef(uid, type) {
  return collection(db, "users", uid, COLLECTIONS[type]);
}

export async function addFinanceItem(uid, type, payload) {
  return addDoc(collectionRef(uid, type), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function updateFinanceItem(uid, type, id, patch) {
  return updateDoc(doc(db, "users", uid, COLLECTIONS[type], id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFinanceItem(uid, type, id) {
  return deleteDoc(doc(db, "users", uid, COLLECTIONS[type], id));
}

export async function deleteAllUserFinanceData(uid) {
  for (const collectionName of Object.values(COLLECTIONS)) {
    const snapshot = await getDocs(collection(db, "users", uid, collectionName));
    const docs = snapshot.docs;

    // Firestore aceita no máximo 500 operações por batch. Usamos 400
    // para manter margem e funcionar mesmo quando a conta crescer.
    for (let start = 0; start < docs.length; start += 400) {
      const batch = writeBatch(db);
      docs.slice(start, start + 400).forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
  }
}

export async function deleteAccountAndData(user) {
  if (!user) throw new Error("Usuário não autenticado.");

  // A exclusão da conta é uma operação sensível. Reautenticar ANTES de
  // apagar os dados evita perder registros caso o login recente seja exigido.
  await reauthenticateWithPopup(user, googleProvider);
  await deleteAllUserFinanceData(user.uid);
  await deleteUser(user);
}
