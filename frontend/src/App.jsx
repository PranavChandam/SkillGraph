import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [developers, setDevelopers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [developer, setDeveloper] = useState("");
  const [role, setRole] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);

const currentSkills = result?.ownedSkills || [];

const relatedSkills = [
  ...new Set(
    recommendations.flatMap((item) => item.relatedSkills)
  )
].filter((skill) => !currentSkills.includes(skill));

  useEffect(() => {
    async function loadData() {
      try {
        const [developersResponse, rolesResponse] = await Promise.all([
          fetch(`${API_URL}/api/developers`),
          fetch(`${API_URL}/api/roles`)
        ]);

        if (!developersResponse.ok || !rolesResponse.ok) {
          throw new Error("Failed to load data");
        }

        const developersData = await developersResponse.json();
        const rolesData = await rolesResponse.json();

        setDevelopers(developersData);
        setRoles(rolesData);
      } catch (error) {
        setError("Unable to connect to the SkillGraph backend.");
      }
    }

    loadData();
  }, []);

  async function analyzeSkillGap() {

    if (!developer || !role) return;
    setRecommendations([]);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/skill-gap?developer=${encodeURIComponent(
          developer
        )}&role=${encodeURIComponent(role)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze skill gap");
      }

      setResult(data);

      const exploreResponse = await fetch(
        `${API_URL}/api/explore/${encodeURIComponent(developer)}`
      );

      const exploreData = await exploreResponse.json();

      if (exploreResponse.ok) {
        setRecommendations(exploreData.recommendations);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">SkillGraph</div>
        <div className="nav-link">Career Explorer</div>
      </header>

      <main className="container">
        <section className="hero">
          <p className="eyebrow">CAREER SKILL EXPLORER</p>

          <h1>
            Understand your skills.
            <br />
            Discover your next step.
          </h1>

          <p className="subtitle">
            Explore the relationship between your skills and the technologies
            required for your target career.
          </p>
        </section>

        <section className="selection-card">
          <div className="field">
            <label>Developer</label>

            <select
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
            >
              <option value="">Select developer</option>

              {developers.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Target Role</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select target role</option>

              {roles.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={!developer || !role || loading}
            onClick={analyzeSkillGap}
          >
            {loading ? "Analyzing..." : "Analyze Skill Gap"}
          </button>
        </section>

        {error && (
          <section className="error-state">
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </section>
        )}

        {result && (
          <section className="results">
            <div className="results-header">
              <div>
                <p className="eyebrow">SKILL GAP ANALYSIS</p>
                <h2>{result.developer}</h2>
                <p>Target role: {result.role}</p>
              </div>

              <div className="gap-count">
                {result.missingSkills.length}
                <span>skills to learn</span>
              </div>
            </div>

            <div className="skill-columns">
              <div className="skill-card">
                <h3>Skills you have</h3>

                {result.ownedSkills.map((skill) => (
                  <div className="skill-item" key={skill}>
                    <span className="check">✓</span>
                    {skill}
                  </div>
                ))}
              </div>

              <div className="skill-card">
                <h3>Skills to develop</h3>

                {result.missingSkills.map((skill) => (
                  <div className="skill-item" key={skill}>
                    <span className="missing">○</span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            {recommendations.length > 0 && (
              <div className="related-section">
                <p className="eyebrow">GRAPH EXPLORATION</p>

                <h3>Explore related skills</h3>

                <p className="related-description">
                  Discover technologies connected to the skills you already know.
                </p>

                <div className="related-grid">
                  {recommendations.map((item) => (
                    <div className="related-card" key={item.currentSkill}>
                      <div className="current-skill">
                        {item.currentSkill}
                      </div>

                      <div className="arrow">↓</div>

                      <div className="related-skills">
                        {item.relatedSkills.map((skill) => (
                          <span className="related-tag" key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="graph-section">
              <p className="eyebrow">SKILL RELATIONSHIP MAP</p>

              <h3>How your skills connect</h3>

              <p className="related-description">
                This view shows how your existing skills connect to related technologies
                in the SkillGraph.
              </p>

              <div className="graph-container">
                <svg
                  className="skill-graph"
                  viewBox="0 0 900 420"
                  role="img"
                  aria-label="Dynamic skill relationship graph"
                >
                  {/* Developer → Existing skills */}
                  {currentSkills.slice(0, 4).map((skill, index) => {
                    const y = 70 + index * 95;

                    return (
                      <line
                        key={`developer-${skill}`}
                        x1="450"
                        y1="210"
                        x2="180"
                        y2={y}
                        className="graph-line"
                      />
                    );
                  })}

                  {/* Existing skills → Related skills */}
                  {recommendations.flatMap((item) => {
                    const currentIndex = currentSkills
                      .slice(0, 4)
                      .indexOf(item.currentSkill);

                    if (currentIndex === -1) return [];

                    const currentY = 70 + currentIndex * 95;

                    return item.relatedSkills.slice(0, 4).map((skill) => {
                      const relatedIndex = relatedSkills.indexOf(skill);

                      if (relatedIndex === -1) return null;

                      const relatedY = 70 + relatedIndex * 95;

                      return (
                        <line
                          key={`${item.currentSkill}-${skill}`}
                          x1="235"
                          y1={currentY}
                          x2="665"
                          y2={relatedY}
                          className="graph-line"
                        />
                      );
                    });
                  })}

                  {/* Existing skill nodes */}
                  {currentSkills.slice(0, 4).map((skill, index) => {
                    const y = 70 + index * 95;

                    return (
                      <g key={skill}>
                        <circle
                          cx="180"
                          cy={y}
                          r="48"
                          className="graph-node current"
                        />

                        <text
                          x="180"
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="graph-text"
                        >
                          {skill}
                        </text>
                      </g>
                    );
                  })}

                  {/* Developer node */}
                  <circle
                    cx="450"
                    cy="210"
                    r="65"
                    className="graph-node center"
                  />

                  <text
                    x="450"
                    y="210"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="graph-text center-text"
                  >
                    {developer}
                  </text>

                  {/* Related skill nodes */}
                  {relatedSkills.slice(0, 4).map((skill, index) => {
                    const y = 70 + index * 95;

                    return (
                      <g key={skill}>
                        <circle
                          cx="720"
                          cy={y}
                          r="48"
                          className="graph-node related"
                        />

                        <text
                          x="720"
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="graph-text"
                        >
                          {skill}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="graph-legend">
                  <span>
                    <i className="legend-dot current-dot"></i>
                    Existing skill
                  </span>

                  <span>
                    <i className="legend-dot center-dot"></i>
                    Developer
                  </span>

                  {relatedSkills.length > 0 && (
                    <span>
                      <i className="legend-dot related-dot"></i>
                      Related technology
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;