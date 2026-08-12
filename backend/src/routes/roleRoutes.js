import express from "express";
import driver from "../db.js";

const router = express.Router();

// Get all job roles
router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (r:JobRole)
      RETURN r.name AS name
      ORDER BY r.name
    `);

    const roles = result.records.map((record) => ({
      name: record.get("name")
    }));

    res.json(roles);
  } catch (error) {
    console.error("Failed to fetch roles:", error.message);

    res.status(500).json({
      message: "Failed to fetch roles"
    });
  } finally {
    await session.close();
  }
});

// Get skills required for a specific role
router.get("/:role/skills", async (req, res) => {
  const session = driver.session();
  const { role } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (s:Skill)-[:REQUIRED_FOR]->(r:JobRole {name: $role})
      RETURN r.name AS role, collect(s.name) AS skills
      `,
      { role }
    );

    if (result.records.length === 0) {
      return res.status(404).json({
        message: "Job role not found"
      });
    }

    const record = result.records[0];

    res.json({
      role: record.get("role"),
      skills: record.get("skills")
    });
  } catch (error) {
    console.error("Failed to fetch role skills:", error.message);

    res.status(500).json({
      message: "Failed to fetch role skills"
    });
  } finally {
    await session.close();
  }
});

export default router;