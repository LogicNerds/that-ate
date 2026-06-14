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

// Find by name + standardized address — prevents duplicates
export async function findRestaurantByNameAndAddress(name, addressKey) {
  const q = query(
    collection(db, "restaurants"),
    where("nameLower", "==", name.toLowerCase()),
    where("addressKey", "==", addressKey)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Find all locations of a chain by name only (for pre-seeded chains)
export async function findRestaurantsByName(name) {
  const q = query(
    collection(db, "restaurants"),
    where("nameLower", "==", name.toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createRestaurant({ name, address, addressKey, type }) {
  const ref = await addDoc(collection(db, "restaurants"), {
    name,
    nameLower:   name.toLowerCase(),
    address:     address    || "",
    addressKey:  addressKey || "",   // normalized key for dedup
    type:        type       || "",
    avgRating:   0,
    reviewCount: 0,
    createdAt:   serverTimestamp(),
  });
  return ref.id;
}

// Seed national chains — only runs if they don't already exist
export async function seedChains() {
  const chains = [
    { name: "McDonald's",       type: "Fast Food" },
    { name: "Chick-fil-A",      type: "Fast Food" },
    { name: "Chipotle",         type: "Fast Casual" },
    { name: "Taco Bell",        type: "Fast Food" },
    { name: "Subway",           type: "Fast Food" },
    { name: "Starbucks",        type: "Café / Bakery" },
    { name: "Dunkin'",          type: "Café / Bakery" },
    { name: "Burger King",      type: "Fast Food" },
    { name: "Wendy's",          type: "Fast Food" },
    { name: "Popeyes",          type: "Fast Food" },
    { name: "Raising Cane's",   type: "Fast Food" },
    { name: "Wingstop",         type: "Fast Casual" },
    { name: "Panda Express",    type: "Fast Casual" },
    { name: "Panera Bread",     type: "Fast Casual" },
    { name: "Five Guys",        type: "Fast Casual" },
    { name: "Shake Shack",      type: "Fast Casual" },
    { name: "In-N-Out Burger",  type: "Fast Food" },
    { name: "Whataburger",      type: "Fast Food" },
    { name: "Sonic",            type: "Fast Food" },
    { name: "Jack in the Box",  type: "Fast Food" },
    { name: "Olive Garden",     type: "Casual Dining" },
    { name: "Applebee's",       type: "Casual Dining" },
    { name: "Chili's",          type: "Casual Dining" },
    { name: "Buffalo Wild Wings", type: "Casual Dining" },
    { name: "Denny's",          type: "Breakfast / Brunch" },
    { name: "IHOP",             type: "Breakfast / Brunch" },
    { name: "Waffle House",     type: "Breakfast / Brunch" },
    { name: "Cracker Barrel",   type: "Casual Dining" },
    { name: "Texas Roadhouse",  type: "Steakhouse" },
    { name: "Outback Steakhouse", type: "Steakhouse" },
    { name: "LongHorn Steakhouse", type: "Steakhouse" },
    { name: "Red Lobster",      type: "Seafood" },
    { name: "The Cheesecake Factory", type: "Casual Dining" },
    { name: "P.F. Chang's",     type: "Casual Dining" },
    { name: "Domino's",         type: "Pizza" },
    { name: "Pizza Hut",        type: "Pizza" },
    { name: "Papa John's",      type: "Pizza" },
    { name: "Little Caesars",   type: "Pizza" },
    { name: "Dairy Queen",      type: "Dessert / Ice Cream" },
    { name: "Baskin-Robbins",   type: "Dessert / Ice Cream" },
  ];

  const existing = await getAllRestaurants();
  const existingNames = new Set(existing.map(r => r.nameLower));

  const toSeed = chains.filter(c => !existingNames.has(c.name.toLowerCase()));
  for (const chain of toSeed) {
    await addDoc(collection(db, "restaurants"), {
      name:        chain.name,
      nameLower:   chain.name.toLowerCase(),
      address:     "",
      addressKey:  "",
      type:        chain.type,
      avgRating:   0,
      reviewCount: 0,
      isChain:     true,
      createdAt:   serverTimestamp(),
    });
  }
  return toSeed.length;
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

export async function addReview({ restaurantId, restaurantName, dish, rating, comment, photoURL, userId, userName }) {
  await addDoc(collection(db, "reviews"), {
    restaurantId, restaurantName,
    userId, userName,
    dish, rating, comment,
    photoURL: photoURL || null,
    createdAt: serverTimestamp(),
  });

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
