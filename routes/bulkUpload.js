import express from "express";
import { fileUpload, batchSubmit, getBatchQr } from "../controller/bulkUploadController.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/file", upload.single("file"), fileUpload);
router.post("/submit", batchSubmit)
router.post("/getBatch", getBatchQr)

export default router;
