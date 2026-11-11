
import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import http from "http";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

/* =====================================================
   ROUTES
===================================================== */
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import employeeBankDetailsRoutes from "./routes/employeeBankDetailsRoutes.js";
import employeeLoginRoutes from "./routes/employeeLoginRoutes.js";

const app = express();

/* =====================================================
   CORS CONFIGURATION
===================================================== */

const normalizeOrigin = (url?: string) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
};

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3001",

  // Production frontend
  "https://erp.mkrinfotech.com",
  "https://www.erp.mkrinfotech.com",

  // API domain - required for Swagger
  "https://apiepr.mkrinfotech.com",

  // Environment frontend URL
  normalizeOrigin(process.env.FRONTEND_URL),
]
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("CORS BLOCKED ORIGIN:", normalizedOrigin);

    return callback(
      new Error(`Not allowed by CORS: ${normalizedOrigin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.disable("x-powered-by");

/* =====================================================
   STATIC FILES (UPLOADS)
===================================================== */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "ERP MKRINFOTECH API is working",
  });
});

/* =====================================================
   SWAGGER
===================================================== */

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/* =====================================================
   API ROUTES
===================================================== */

// Public authentication routes (no token required)
app.use("/api", adminAuthRoutes);
app.use("/api", employeeLoginRoutes);

// Protected routes
app.use("/api", adminRoutes);
app.use("/api", employeeRoutes);
app.use("/api", employeeBankDetailsRoutes);

export default app;
