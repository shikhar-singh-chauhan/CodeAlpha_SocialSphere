const multer = require("multer");
const {
  CloudinaryStorage,
} = require(
  "multer-storage-cloudinary"
);

const cloudinary = require(
  "../config/cloudinary"
);

// ==========================================
// CLOUDINARY STORAGE
// ==========================================

const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => {
      const isVideo =
        file.mimetype.startsWith(
          "video/"
        );

      return {
        folder:
          "socialsphere/posts",

        resource_type:
          isVideo
            ? "video"
            : "image",

        allowed_formats:
          isVideo
            ? [
                "mp4",
                "webm",
                "mov",
              ]
            : [
                "jpg",
                "jpeg",
                "png",
                "webp",
              ],
      };
    },
  });

// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (
    allowedImageTypes.includes(
      file.mimetype
    ) ||
    allowedVideoTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP, MP4, WEBM and MOV files are allowed"
      ),
      false
    );
  }
};

// ==========================================
// MULTER CONFIG
// ==========================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      50 * 1024 * 1024,
  },
});

module.exports = upload;