const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.secureDeletePost = functions.https.onCall(async (data, context) => {
    const { collectionName, docId, providedPin } = data;

    // 1. Validate Input
    if (!collectionName || !docId || !providedPin) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required arguments: collectionName, docId, or providedPin."
        );
    }

    // 2. Validate Collection Name (Security)
    const allowedCollections = ["needs", "people", "volunteers"];
    if (!allowedCollections.includes(collectionName)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid collection name."
        );
    }

    try {
        const docRef = admin.firestore().collection(collectionName).doc(docId);
        const doc = await docRef.get();

        // 3. Check if Document Exists
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Post not found.");
        }

        const postData = doc.data();

        // 4. Validate PIN
        if (!postData.secretPin) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "This post does not have a PIN set. Cannot delete securely."
            );
        }

        if (postData.secretPin !== providedPin) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Incorrect PIN."
            );
        }

        // 5. Delete Document
        await docRef.delete();

        return { success: true, message: "Post deleted successfully." };
    } catch (error) {
        console.error("Error deleting post:", error);
        // Re-throw HttpsError if it's already one, otherwise wrap it
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Internal server error.");
    }
});

exports.secureUpdatePost = functions.https.onCall(async (data, context) => {
    const { collectionName, docId, providedPin, updateData } = data;

    // 1. Validate Input
    if (!collectionName || !docId || !providedPin || !updateData) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required arguments: collectionName, docId, providedPin, or updateData."
        );
    }

    // 2. Validate Collection Name
    const allowedCollections = ["needs", "people", "volunteers"];
    if (!allowedCollections.includes(collectionName)) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Invalid collection name."
        );
    }

    try {
        const docRef = admin.firestore().collection(collectionName).doc(docId);
        const doc = await docRef.get();

        // 3. Check if Document Exists
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Post not found.");
        }

        const postData = doc.data();

        // 4. Validate PIN
        if (!postData.secretPin) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "This post does not have a PIN set. Cannot update securely."
            );
        }

        if (postData.secretPin !== providedPin) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Incorrect PIN."
            );
        }

        // 5. Update Document
        // Remove sensitive or immutable fields from updateData if necessary
        // For now, we assume updateData is sanitized on client, but good to be safe
        const { id, secretPin, createdAt, ...safeUpdateData } = updateData;

        await docRef.update(safeUpdateData);

        return { success: true, message: "Post updated successfully." };
    } catch (error) {
        console.error("Error updating post:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Internal server error.");
    }
});
