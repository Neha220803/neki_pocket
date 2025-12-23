// ============================================
// FIRESTORE HELPERS
// Convert Firestore data types for API responses
// ============================================

/**
 * Convert Firestore Timestamp to ISO string
 */
export function serializeTimestamp(timestamp) {
  if (!timestamp) return null;

  // Handle Firebase Admin Timestamp
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }

  // Handle Firebase Client Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  // Already a Date or string
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  return timestamp;
}

/**
 * Serialize a Firestore document for API response
 */
export function serializeDoc(doc) {
  const data = { ...doc };

  // Convert all Timestamp fields
  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Check if it's a Timestamp
    if (
      value &&
      (value._seconds !== undefined ||
        (value.toDate && typeof value.toDate === "function"))
    ) {
      data[key] = serializeTimestamp(value);
    }
  });

  return data;
}

/**
 * Serialize array of documents
 */
export function serializeDocs(docs) {
  return docs.map((doc) => serializeDoc(doc));
}
