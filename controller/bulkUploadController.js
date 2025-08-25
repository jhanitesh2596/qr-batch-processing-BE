import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import fetch from "node-fetch";
import xlxs from "xlsx";
import { qrBatchProcess } from "../schedular/batchSchedular.js";
import { pool } from "../db.js";
import { connection } from "../redisClient.js";
import { v4 as uuidv4 } from 'uuid';

export const fileUpload = async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "csv-uploads",
        resource_type: "raw",
        filename_override: req.file.originalname,
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({
          message: "File uploaded successfully",
          url: result.secure_url,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.log(error);
  }
};

export const batchSubmit = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const batchResponse = await fetch(fileUrl);
    const fileBuffer = await batchResponse.arrayBuffer();
    const sheet = xlxs.readFile(fileBuffer, { type: "buffer" });
    const sheets = sheet.SheetNames;
    const batch_id = uuidv4();
    let count = 0

    for (let i = 0; i < sheets.length; i++) {
      const temp = xlxs.utils.sheet_to_json(sheet.Sheets[sheet.SheetNames[i]]);
      temp.forEach((file, idx) => {
        qrBatchProcess({ ...file, id: idx, batch_id });
        count ++
      });
    }
    await connection.set(`batch:${batch_id}:done`, 0);
    await connection.set(`batch:${batch_id}:total`, count);
    res.status(200).json({
      message:
        "Your batch file is submitted successfully, You will be notified via email once processed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBatchQr = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "No batch ID detected" });

    const query = `
    SELECT * FROM userqr
    WHERE user_id = ?
    `;
    const [result] = await pool.query(query, [userId]);
    if (result?.length) {
      res.status(200).json({ batch: result });
    }
  } catch (error) {
    console.log(error);
  }
};
