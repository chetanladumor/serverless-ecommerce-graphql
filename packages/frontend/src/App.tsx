import { useState, useEffect } from "react";
import { RegisterModal } from "./components/RegisterModal";
import { User, LogOut, Sparkles, CheckCircle2 } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleRegisterSuccess = (user: UserData) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                CloudMarket
              </h1>
            </div>
          </div>

          <div>
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "999px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.875rem",
                  }}
                >
                  <User size={16} style={{ color: "var(--primary)" }} />
                  <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "var(--success)",
                      fontWeight: 700,
                    }}
                  >
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    borderRadius: "var(--radius-sm)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsRegisterOpen(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        <div
          style={{
            background: "linear-gradient(180deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.4) 100%)",
            padding: "40px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-card)",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "16px" }}>
            <Sparkles size={14} />
            <span>STEP 3 • AUTHENTICATION PIPELINE</span>
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>
            GraphQL User Registration
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.6 }}>
            Users register through a GraphQL mutation with strict input validation, <strong>bcrypt</strong> password hashing (10 salt rounds), <strong>PostgreSQL</strong> persistence via Prisma, and <strong>JWT</strong> token signing.
          </p>

          {currentUser ? (
            <div
              style={{
                marginTop: "28px",
                padding: "20px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              <CheckCircle2 size={24} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ color: "var(--success)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>
                  Registration Successful!
                </h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Logged in as <strong>{currentUser.name}</strong> ({currentUser.email}). Your JWT session token is securely stored in <code>localStorage</code>.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "28px" }}>
              <button
                onClick={() => setIsRegisterOpen(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                Try Registering a User
              </button>
            </div>
          )}
        </div>
      </main>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
}

export default App;
