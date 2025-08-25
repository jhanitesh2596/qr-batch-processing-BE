import { Worker } from "bullmq";
import { connection } from "../redisClient.js";
import QRCode from "qrcode";
import { pool } from "../db.js";
import { sendEmail } from "../sendEmail.js";
import { pusher } from "../index.js";


const updateTracker = async (batchId, type) => {
  const key = `batch:${batchId}`;
  if (type === "completed") {
    await connection.hincrby(key, "completed", 1);
    await connection.hsetnx(key, "failed", 0);
  } else {
    await connection.hincrby(key, "failed", 1);
    await connection.hsetnx(key, "completed", 0);
  }
};

const handleBatchTracker = async (job, type) => {
  const batchId = job?.data?.qrJson?.batch_id;
  updateTracker(batchId, type);
  const doneKey = `batch:${batchId}:done`;
  const totalKey = `batch:${batchId}:total`;
  const done = await connection.incr(doneKey);
  const total = await connection.get(totalKey);
  let status = "processing";
  const completed = await connection.hget(`batch:${batchId}`, "completed");
  const failed = await connection.hget(`batch:${batchId}`, "failed");
  if (done == total) {
    console.log(`✅ All jobs completed for batch ${batchId}`);
    status = "completed";

    await sendEmail("", completed, failed);
  }
  try {
    await pusher.trigger("batch-processing-status", "batch-status", {
      message: JSON.stringify({
        qrData: job?.data?.qrJson,
        completed: parseInt(completed),
        failed: parseInt(failed),
        total: parseInt(total),
        status: status,
      }),
    });
    await pool.query(
      `
     UPDATE userqr
     SET failed = ?, completed = ?, total = ?
     WHERE batch_id = ? AND user_id = ? 
      `,
      [record?.failed, record?.completed, total, batchId, 2]
    );
  } catch (err) {
    console.error("Pusher trigger error:", err);
  }
};

const generateQR = async (text, id) => {
  try {
    if (["1", "6", "11", "12"].includes(String(id))) {
      throw new Error("Invalid Data");
    }
    return await QRCode.toDataURL(text, {
      color: {
        dark: "#00F",
        light: "#0000",
      },
    });
  } catch (err) {
    console.error("generateQRError", err);
    throw err;
  }
};

const worker = new Worker(
  "processBatchQr",
  async (job) => {
    const { id, qrJson } = job.data;

    if (!qrJson?.url) {
      throw new Error("Missing qrJson.url");
    }
    try {
      const url = await generateQR(qrJson.url, id);
      if (url) {
        try {
          const updateQuery = `
    UPDATE userqr
    SET qrcodes = JSON_ARRAY_APPEND(qrcodes, '$', CAST(? AS JSON))
    WHERE user_id = ? AND batch_id = ?
  `;

          const data = JSON.stringify({ name: qrJson.name, url });
          const [result] = await pool.query(updateQuery, [
            data,
            2,
            qrJson.batch_id,
          ]);
          if (result.affectedRows === 0) {
            const insertQuery = `
      INSERT INTO userqr (user_id, batch_id, qrcodes)
      VALUES (?, ?, JSON_ARRAY(?))
    `;
            await pool.execute(insertQuery, [2, qrJson.batch_id, data]);
          }
        } catch (error) {
          throw new Error("Database insert failed for QR code");
        }
      } else {
        throw new Error("Invalid data Eroor ");
      }
    } catch (error) {
      throw new Error("Database insert failed for QR code");
    }
  },
  { connection }
);
worker.on("error", (err) => {
  console.error("Worker error:", err);
});

worker.on("failed", async (job, err) => {
  try {
    if (job.attemptsMade >= job.opts.attempts) {
      await handleBatchTracker(job, "failed");
    }
  } catch (error) {
    console.log("failed", error);
  }
});

worker.on("completed", async (job) => {
  try {
    await handleBatchTracker(job, "completed");
  } catch (error) {
    console.log("err", error);
  }
});
