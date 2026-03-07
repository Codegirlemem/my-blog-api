import multer from "multer";
import AppError from "../utils/appError.utils.js";
import { allowedFiles } from "../utils/index.utils.js";

const storage = multer.diskStorage({
  destination: "uploads/",
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter(req, file, cb) {
    if (!allowedFiles.includes(file.mimetype)) {
      return cb(
        new AppError("Only jpg, jpeg, png, and webp images are allowed", 400),
      );
    }
    cb(null, true);
  },
});

export default upload;
