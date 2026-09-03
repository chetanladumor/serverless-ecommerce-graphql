import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "./graphql/queries";
import { apolloClient } from "./apollo/client";
import { AuthModal, UserData } from "./components/AuthModal";
import { User, LogOut, Sparkles, CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";

export function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Auto-fetch current user profile with me query if token exists
  const token = localStorage.getItem("token");
  const { data: meData, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.me) {
        setCurrentUser(data.me);
        localStorage.setItem("user", JSON.stringify(data.me));
      }
    },
    onError: () => {
      // Token invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
    },
  });

  useEffect(() => {
    if (meData?.me) {
      setCurrentUser(meData.me);
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, [meData]);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: UserData) => {
    setCurrentUser(user);
    refetchMe();
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    await apolloClient.resetStore();
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
              <ShoppingBag size={20} />
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
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => openAuth("login")}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth("register")}
                  style={{
                    padding: "9px 18px",
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
              </div>
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
            <span>STEP 4 • LOGIN & AUTH CONTEXT VERIFIED</span>
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>
            Full-Stack Authentication Pipeline
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.6 }}>
            Users can register, log in with bcrypt password verification, and securely query their session via GraphQL <code>me</code> queries powered by Express context JWT token extraction.
          </p>

          {currentUser ? (
            <div
              style={{
                marginTop: "28px",
                padding: "24px",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <CheckCircle2 size={24} style={{ color: "var(--success)" }} />
                <h4 style={{ color: "var(--success)", fontSize: "1.15rem", fontWeight: 700 }}>
                  Active User Session Confirmed
                </h4>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
                <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>User ID</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "4px", fontFamily: "monospace" }}>{currentUser.id}</div>
                </div>

                <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Name & Email</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: "4px", fontWeight: 600 }}>{currentUser.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{currentUser.email}</div>
                </div>

                <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Role & Permissions</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px", color: "var(--success)", fontWeight: 700, fontSize: "0.85rem" }}>
                    <ShieldCheck size={16} />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
              <button
                onClick={() => openAuth("login")}
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
                Sign In to Your Account
              </button>
              <button
                onClick={() => openAuth("register")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                Create New Account
              </button>
            </div>
          )}
        </div>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
