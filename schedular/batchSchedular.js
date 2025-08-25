import { processBatchQr } from "../queue/batchQueue.js";

export const qrBatchProcess = async (qrJson) => {
  try {
    await processBatchQr.add(
      "processBatch",
      {
        id: qrJson.id,
        qrJson: qrJson,
      },
      {
        jobId: `batch-qr-${qrJson.id}`,
        removeOnComplete: {count: 0},
        removeOnFail: {count: 0},
        attempts: 1,
        backoff : {
          type: "fixed",
          delay: 3000
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
