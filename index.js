var cron = require("node-cron");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} = require("firebase-admin/firestore");
const { getRandomValue } = require("./utils");
const serviceAccount = require("./service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

let count = 0;

const fetchDocuments = async () => {
  try {
    const trackers = [];
    const trackersBatch = db.batch();
    const trackersRef = db.collection("trackers");
    const snapshot = await trackersRef.get();

    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    snapshot.forEach((doc) => {
      trackers.push(doc.data());
    });

    trackers.forEach((tracker) => {
      const metricsChanges = {
        ...tracker,
        metrics: {
          ...tracker.metrics,
          temperature: tracker.metrics.temperature + getRandomValue(-5, 5),
          battery:
            tracker.metrics.battery < 10 ? 95 : tracker.metrics.battery - 1,
          trackerHumidity:
            tracker.metrics.trackerHumidity + getRandomValue(-5, 5),
        },
      };
      const newTrackerRef = db.collection("trackers").doc(tracker.id);
      trackersBatch.set(newTrackerRef, metricsChanges);
    });

    trackersBatch.commit();
  } catch (error) {
    console.log("ERROR", error);
  }
};

cron.schedule("*/5 * * * * *", () => {
  console.log("STARTED JOB");
  fetchDocuments();
});
