import express from "express";
import { createCorsMiddleware, errorHandler } from "@novarium/shared";
import { env } from "./config/env";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import productAdminRoutes from "./routes/product.admin.routes";
import categoryAdminRoutes from "./routes/category.admin.routes";
import reviewRoutes from "./routes/review.routes";
import shippingRoutes from "./routes/shipping.routes";
import analyticsRoutes from "./routes/analytics.routes";
import healthRoutes from "./routes/health.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

app.use(createCorsMiddleware(env.ALLOWED_ORIGINS));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "commerce-service" });
});

// For storefront BFF
app.use("/api/commerce/products", productRoutes);
app.use("/api/commerce/categories", categoryRoutes);
app.use("/api/commerce/reviews", reviewRoutes);
app.use("/api/commerce/shipping", shippingRoutes);

// For admin BFF
app.use("/api/commerce/admin/products", productAdminRoutes);
app.use("/api/commerce/admin/categories", categoryAdminRoutes);
app.use("/api/commerce/admin/analytics", analyticsRoutes);
app.use("/api/commerce/admin/uploads", uploadRoutes);

app.use("/api/commerce/health", healthRoutes);

// Error Handler
app.use(errorHandler);

export default app;
