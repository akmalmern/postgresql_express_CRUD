// src/app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const requestId = require("./middlewares/requestId");
const { errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes");

const language = require("./middlewares/language");

const app = express();
app.use(requestId);
app.use(language);
// ✅ Security headers
app.use(helmet());

// ✅ JSON body
app.use(express.json());

// ✅ Cookie’larni o‘qish
app.use(cookieParser());

// ✅ CORS (frontend domeningizga moslab qo‘ying)
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// ✅ Log
app.use(morgan("dev"));

// ✅ uploads papkani static qilib ochamiz: /uploads/...
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
