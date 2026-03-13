const multer   = require("multer");
const cloudinary = require("cloudinary").v2;
const path     = require("path");
const fs       = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Make sure uploads/ folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// File filters
const zipFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ["application/zip","application/x-zip-compressed","application/x-zip","multipart/x-zip"];
  if (allowedMimes.includes(file.mimetype) || ext === ".zip") {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP files allowed"), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP or GIF allowed"), false);
  }
};

// Multer instances
const uploadZip = multer({
  storage,
  fileFilter: zipFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadAttachment = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Upload local file to Cloudinary then delete it from disk
const uploadToCloudinary = async (filePath, options) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    // Delete from local disk after upload
    fs.unlinkSync(filePath);
    return result;
  } catch (err) {
    // Still clean up even on error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
    throw err;
  }
};

module.exports = {
  cloudinary,
  uploadZip,
  uploadAvatar,
  uploadAttachment,
  uploadToCloudinary,
  deleteFromCloudinary,
};