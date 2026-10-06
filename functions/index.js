/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onRequest} = require("firebase-functions/https");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {setGlobalOptions} = require("firebase-functions");
const {getFirestore} = require("firebase-admin/firestore");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.onRatingWrite = onDocumentWritten(
    `poems/{poemId}/ratings/{uid}`,
    async (event) => {
      const poemId = event.params.poemId;
      const db = getFirestore();

      const ratingsSnap = await db
          .collection("poems")
          .doc(poemId)
          .collection("ratings")
          .get();

      if (event.data.before.data().value === event.data.after.data().value) {
        return;
      }

      const values = ratingsSnap.docs.map((d) => d.data().value);

      const avgRating = values.length ?
        values.reduce((sum, v) => sum + v, 0) / values.length : 0;

      await db.collection("poems").doc(poemId).update({
        avgRating,
        ratingCount: values.length,
      });
    },
);
