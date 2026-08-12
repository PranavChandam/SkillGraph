import express from "express";
import driver from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (s:Skill)
      RETURN s.name AS name
      ORDER BY s.name
    `);

    const skills = result.records.map((record) => ({
      name: record.get("name")
    }));

    res.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error.message);

    res.status(500).json({
      message: "Failed to fetch skills"
    });
  } finally {
    await session.close();
  }
});

export default router;