import { useState } from "react";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "../graphql/mutations";
import { X, LogIn, UserPlus, AlertCircle } from "lucide-react";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess: (user: UserData, token: string) => void;
}

export function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { user, token } = data.register;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onSuccess(user, token);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to register. Please try again.");
    },
  });

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { user, token } = data.login;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onSuccess(user, token);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to log in. Please check your credentials.");
    },
  });

  if (!isOpen) return null;

  const isLoading = registerLoading || loginLoading;

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrorMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setErrorMessage("Please enter your full name");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long");
        return;
      }
      registerUser({
        variables: {
          input: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          },
        },
      });
    } else {
      loginUser({
        variables: {
          input: {
            email: email.trim().toLowerCase(),
            password,
          },
        },
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          width: "100%",
          maxWidth: "440px",
          padding: "32px",
          boxShadow: "var(--shadow-card)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "1.25rem",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            backgroundColor: "var(--bg-main)",
            padding: "4px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "24px",
            border: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => switchMode("login")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "calc(var(--radius-sm) - 2px)",
              fontSize: "0.9rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: mode === "login" ? "var(--bg-card)" : "transparent",
              color: mode === "login" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: mode === "login" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "calc(var(--radius-sm) - 2px)",
              fontSize: "0.9rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: mode === "register" ? "var(--bg-card)" : "transparent",
              color: mode === "register" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: mode === "register" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </div>

        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "6px" }}>
          {mode === "login" ? "Welcome Back" : "Join CloudMarket"}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.875rem" }}>
          {mode === "login"
            ? "Enter your credentials to access your account."
            : "Sign up to start browsing and purchasing products."}
        </p>

        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-sm)",
              color: "#fca5a5",
              fontSize: "0.875rem",
              marginBottom: "18px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Chetan Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="chetan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 13px",
                backgroundColor: "var(--bg-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder={mode === "register" ? "Min 6 characters" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 13px",
                backgroundColor: "var(--bg-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              borderRadius: "var(--radius-sm)",
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {isLoading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
