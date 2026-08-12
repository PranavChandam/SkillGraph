import express from "express";
import driver from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  const { developer, role } = req.query;

  if (!developer || !role) {
    return res.status(400).json({
      message: "developer and role are required"
    });
  }

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {name: $developer})
      MATCH (r:JobRole {name: $role})

      OPTIONAL MATCH (d)-[:HAS_SKILL]->(owned:Skill)

      OPTIONAL MATCH (required:Skill)-[:REQUIRED_FOR]->(r)

      WITH
        d,
        r,
        collect(DISTINCT owned.name) AS ownedSkills,
        collect(DISTINCT required.name) AS requiredSkills

      RETURN
        d.name AS developer,
        r.name AS role,
        ownedSkills,
        requiredSkills
      `,
      {
        developer,
        role
      }
    );

    if (result.records.length === 0) {
      return res.status(404).json({
        message: "Developer or role not found"
      });
    }

    const record = result.records[0];

    const ownedSkills = record.get("ownedSkills");
    const requiredSkills = record.get("requiredSkills");

    const missingSkills = requiredSkills.filter(
      (skill) => !ownedSkills.includes(skill)
    );

    res.json({
      developer: record.get("developer"),
      role: record.get("role"),
      ownedSkills,
      requiredSkills,
      missingSkills
    });
  } catch (error) {
    console.error("Failed to calculate skill gap:", error.message);

    res.status(500).json({
      message: "Failed to calculate skill gap"
    });
  } finally {
    await session.close();
  }
});

export default router;