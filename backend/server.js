import express from "express";
import cors from "cors";
import driver from "./src/db.js";
import developerRoutes from "./src/routes/developerRoutes.js";
import skillRoutes from "./src/routes/skillRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js";
import skillGapRoutes from "./src/routes/skillGapRoutes.js";
import exploreRoutes from "./src/routes/exploreRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/developers", developerRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/explore", exploreRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await driver.verifyConnectivity();

    res.json({
      status: "ok",
      database: "CognoDB"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});