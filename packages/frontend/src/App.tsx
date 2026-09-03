export function App() {
  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CloudMarket GraphQL
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            Serverless E-Commerce Platform on AWS Lambda + PostgreSQL + Redis
          </p>
        </div>
      </header>
      <main>
        <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "12px" }}>🚀 Step 1: Workspace Initialized</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Monorepo configured with TypeScript, Apollo Server on AWS Lambda, PostgreSQL (Prisma), Redis, and React Apollo Client.
          </p>
        </div>
      </main>
    </div>
  );
}
export default App;
