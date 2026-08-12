import express from "express";
import driver from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (d:Developer)
      RETURN d.name AS name
      ORDER BY d.name
    `);

    const developers = result.records.map((record) => ({
      name: record.get("name")
    }));

    res.json(developers);
  } catch (error) {
    console.error("Failed to fetch developers:", error.message);

    res.status(500).json({
      message: "Failed to fetch developers"
    });
  } finally {
    await session.close();
  }
});

router.get("/:name", async (req, res) => {
  const session = driver.session();
  const { name } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {name: $name})
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (d)-[:BUILT]->(p:Project)
      RETURN
        d.name AS name,
        collect(DISTINCT s.name) AS skills,
        collect(DISTINCT p.name) AS projects
      `,
      { name }
    );

    if (result.records.length === 0) {
      return res.status(404).json({
        message: "Developer not found"
      });
    }

    const record = result.records[0];

    res.json({
      name: record.get("name"),
      skills: record.get("skills"),
      projects: record.get("projects")
    });
  } catch (error) {
    console.error("Failed to fetch developer:", error.message);

    res.status(500).json({
      message: "Failed to fetch developer"
    });
  } finally {
    await session.close();
  }
});

export default router;