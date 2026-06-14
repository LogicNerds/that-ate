import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { db } from "./firebase-config.js";

// Reuse the already-initialized app
const storage = getStorage(getApps()[0]);

// Upload a photo File object, returns the public download URL
// Path: reviews/{timestamp}_{filename}
export async function uploadReviewPhoto(file) {
  if (!file) return null;
  const ext      = file.name.split(".").pop();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, `reviews/${filename}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
