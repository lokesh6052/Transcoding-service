import { Router } from "express";
import {
	intiatialzedUpload,
	listObjects,
	uploadChunk,
} from "../controller/multiPartUpload.controller.js";
import multer from "multer";
const upload = multer();

const router = Router();

// Importing the upload the media Controllers here
router.post("/intialized", upload.none(), intiatialzedUpload);

router.post("/chunks", upload.single("file"), uploadChunk);

router.get("/list-objects", listObjects);
export default router;
