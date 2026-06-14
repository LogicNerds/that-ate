import {
  collection, doc, addDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// ── Restaurants ──────────────────────────────────────────────────

export async function getAllRestaurants() {
  const snap = await getDocs(collection(db, "restaurants"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchRestaurants(term) {
  const all = await getAllRestaurants();
  if (!term) return all;
  const low = term.toLowerCase();
  return all.filter(r => r.name.toLowerCase().includes(low));
}

export async function getRestaurant(id) {
  const snap = await getDoc(doc(db, "restaurants", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function findOrCreateRestaurant({ name, address, cuisine }) {
  const q = query(
    collection(db, "restaurants"),
    where("nameLower", "==", name.toLowerCase())
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const ref = await addDoc(collection(db, "restaurants"), {
    name,
    nameLower: name.toLowerCase(),
    address:   address  || "",
    cuisine:   cuisine  || "",
    avgRating:   0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Reviews ──────────────────────────────────────────────────────

export async function getReviewsForRestaurant(restaurantId) {
  const q = query(
    collection(db, "reviews"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getReviewsForUser(userId) {
  const q = query(
    collection(db, "reviews"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addReview({ restaurantId, restaurantName, dish, rating, comment, userId, userName }) {
  await addDoc(collection(db, "reviews"), {
    restaurantId, restaurantName,
    userId, userName,
    dish, rating, comment,
    createdAt: serverTimestamp(),
  });

  // Atomically recalculate avg rating on the restaurant doc
  const rRef = doc(db, "restaurants", restaurantId);
  await runTransaction(db, async tx => {
    const rSnap = await tx.get(rRef);
    if (!rSnap.exists()) return;
    const { avgRating = 0, reviewCount = 0 } = rSnap.data();
    const newCount = reviewCount + 1;
    const newAvg   = (avgRating * reviewCount + rating) / newCount;
    tx.update(rRef, {
      avgRating:   Math.round(newAvg * 10) / 10,
      reviewCount: newCount,
    });
  });
}
