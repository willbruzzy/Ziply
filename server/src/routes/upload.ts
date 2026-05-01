import { Router, Request, Response } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { uploadImage, ALLOWED_MIME_TYPES_LIST } from "../services/blobStorage";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES_LIST.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

router.post(
  "/upload/image",
  authenticate,
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    try {
      const url = await uploadImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      res.json({ url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
