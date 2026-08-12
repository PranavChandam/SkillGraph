import "dotenv/config";
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

const session = driver.session();

const developers = [
  { name: "Rahul" },
  { name: "Priya" },
  { name: "Arjun" },
  { name: "Sneha" },
  { name: "Amit" }
];

const skills = [
  "JavaScript",
  "HTML",
  "CSS",
  "React",
  "TypeScript",
  "Node.js",
  "Express.js",
  "MongoDB",
  "SQL",
  "Python",
  "Java",
  "Spring Boot",
  "Docker",
  "Git"
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer"
];

const projects = [
  "E-Commerce Platform",
  "Task Management App",
  "Food Delivery App",
  "Data Analytics Dashboard",
  "Cloud Deployment Platform"
];

const developerSkills = [
  ["Rahul", "JavaScript"],
  ["Rahul", "React"],
  ["Rahul", "Node.js"],
  ["Rahul", "Git"],

  ["Priya", "Python"],
  ["Priya", "SQL"],
  ["Priya", "React"],
  ["Priya", "Git"],

  ["Arjun", "Java"],
  ["Arjun", "Spring Boot"],
  ["Arjun", "SQL"],
  ["Arjun", "Git"],

  ["Sneha", "React"],
  ["Sneha", "TypeScript"],
  ["Sneha", "Node.js"],
  ["Sneha", "Git"],

  ["Amit", "Python"],
  ["Amit", "Docker"],
  ["Amit", "SQL"],
  ["Amit", "Git"]
];

const developerProjects = [
  ["Rahul", "E-Commerce Platform"],
  ["Priya", "Data Analytics Dashboard"],
  ["Arjun", "Food Delivery App"],
  ["Sneha", "Task Management App"],
  ["Amit", "Cloud Deployment Platform"]
];

const projectSkills = [
  ["E-Commerce Platform", "React"],
  ["E-Commerce Platform", "Node.js"],
  ["E-Commerce Platform", "MongoDB"],
  ["E-Commerce Platform", "JavaScript"],

  ["Task Management App", "React"],
  ["Task Management App", "TypeScript"],
  ["Task Management App", "Node.js"],

  ["Food Delivery App", "Java"],
  ["Food Delivery App", "Spring Boot"],
  ["Food Delivery App", "SQL"],

  ["Data Analytics Dashboard", "Python"],
  ["Data Analytics Dashboard", "SQL"],

  ["Cloud Deployment Platform", "Docker"],
  ["Cloud Deployment Platform", "Python"],
  ["Cloud Deployment Platform", "Git"]
];

const roleSkills = [
  ["Frontend Developer", "HTML"],
  ["Frontend Developer", "CSS"],
  ["Frontend Developer", "JavaScript"],
  ["Frontend Developer", "React"],
  ["Frontend Developer", "TypeScript"],

  ["Backend Developer", "Node.js"],
  ["Backend Developer", "Express.js"],
  ["Backend Developer", "MongoDB"],
  ["Backend Developer", "SQL"],

  ["Full Stack Developer", "JavaScript"],
  ["Full Stack Developer", "React"],
  ["Full Stack Developer", "Node.js"],
  ["Full Stack Developer", "MongoDB"],
  ["Full Stack Developer", "Git"],

  ["Data Analyst", "Python"],
  ["Data Analyst", "SQL"],
  ["Data Analyst", "Git"],

  ["DevOps Engineer", "Docker"],
  ["DevOps Engineer", "Python"],
  ["DevOps Engineer", "Git"]
];

const relatedSkills = [
  ["JavaScript", "TypeScript"],
  ["JavaScript", "React"],
  ["React", "TypeScript"],
  ["Node.js", "Express.js"],
  ["Python", "SQL"],
  ["Java", "Spring Boot"],
  ["Docker", "Git"],
  ["React", "HTML"],
  ["React", "CSS"]
];

try {
  // Clear existing development data
  await session.run(`
    MATCH (n)
    DETACH DELETE n
  `);

  // Create developers
  await session.run(
    `
    UNWIND $developers AS developer
    CREATE (:Developer {name: developer.name})
    `,
    { developers }
  );

  // Create skills
  await session.run(
    `
    UNWIND $skills AS skill
    CREATE (:Skill {name: skill})
    `,
    { skills }
  );

  // Create job roles
  await session.run(
    `
    UNWIND $roles AS role
    CREATE (:JobRole {name: role})
    `,
    { roles }
  );

  // Create projects
  await session.run(
    `
    UNWIND $projects AS project
    CREATE (:Project {name: project})
    `,
    { projects }
  );

  // Developer -> Skill
  await session.run(
    `
    UNWIND $developerSkills AS item
    MATCH (d:Developer {name: item[0]})
    MATCH (s:Skill {name: item[1]})
    CREATE (d)-[:HAS_SKILL]->(s)
    `,
    { developerSkills }
  );

  // Developer -> Project
  await session.run(
    `
    UNWIND $developerProjects AS item
    MATCH (d:Developer {name: item[0]})
    MATCH (p:Project {name: item[1]})
    CREATE (d)-[:BUILT]->(p)
    `,
    { developerProjects }
  );

  // Project -> Skill
  await session.run(
    `
    UNWIND $projectSkills AS item
    MATCH (p:Project {name: item[0]})
    MATCH (s:Skill {name: item[1]})
    CREATE (p)-[:USES]->(s)
    `,
    { projectSkills }
  );

  // Skill -> Job Role
  await session.run(
    `
    UNWIND $roleSkills AS item
    MATCH (r:JobRole {name: item[0]})
    MATCH (s:Skill {name: item[1]})
    CREATE (s)-[:REQUIRED_FOR]->(r)
    `,
    { roleSkills }
  );

  // Skill -> Related Skill
  await session.run(
    `
    UNWIND $relatedSkills AS item
    MATCH (s1:Skill {name: item[0]})
    MATCH (s2:Skill {name: item[1]})
    CREATE (s1)-[:RELATED_TO]->(s2)
    `,
    { relatedSkills }
  );

  console.log("✅ SkillGraph seeded successfully!");
} catch (error) {
  console.error("❌ Seed failed:", error.message);
} finally {
  await session.close();
  await driver.close();
}