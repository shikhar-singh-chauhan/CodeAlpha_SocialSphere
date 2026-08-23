const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ===============================
// ROUTES
// ===============================

const authRoutes =
  require("./routes/authRoutes");

const postRoutes =
  require("./routes/postRoutes");

const userRoutes =
  require("./routes/userRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const commentRoutes =
  require("./routes/commentRoutes");

// ===============================
// APP
// ===============================

const app = express();

// ===============================
// ALLOWED FRONTEND ORIGINS
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",

  process.env.FRONTEND_URL,
].filter(Boolean);

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: function (
      origin,
      callback
    ) {
      // Allow requests without origin
      // e.g. Postman / server-to-server
      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ===============================
// BASIC TEST ROUTE
// ===============================

app.get(
  "/",
  (req, res) => {
    res
      .status(200)
      .json({
        message:
          "SocialSphere API is running",
      });
  }
);

// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/comments",
  commentRoutes
);

// ===============================
// 404 HANDLER
// ===============================

app.use(
  (req, res) => {
    res
      .status(404)
      .json({
        message:
          "Route not found",
      });
  }
);

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      error
    );

    res
      .status(
        error.status || 500
      )
      .json({
        message:
          error.message ||
          "Server error",
      });
  }
);

// ===============================
// MONGODB CONNECTION
// ===============================

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB Connected"
    );
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Error:",
      error.message
    );

    process.exit(1);
  }
};

// ===============================
// SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    }
  );
});