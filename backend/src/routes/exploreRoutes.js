import express from "express";
import driver from "../db.js";

const router = express.Router();

router.get("/:developer", async (req, res) => {
  const session = driver.session();
  const { developer } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {name: $developer})
            -[:HAS_SKILL]->
            (skill:Skill)
            -[:RELATED_TO]->
            (related:Skill)

      RETURN
        d.name AS developer,
        skill.name AS currentSkill,
        collect(DISTINCT related.name) AS relatedSkills
      ORDER BY currentSkill
      `,
      { developer }
    );

    if (result.records.length === 0) {
      return res.status(404).json({
        message: "Developer or related skills not found"
      });
    }

    const recommendations = result.records.map((record) => ({
      currentSkill: record.get("currentSkill"),
      relatedSkills: record.get("relatedSkills")
    }));

    res.json({
      developer,
      recommendations
    });
  } catch (error) {
    console.error("Failed to explore skills:", error.message);

    res.status(500).json({
      message: "Failed to explore skills"
    });
  } finally {
    await session.close();
  }
});

export default router;