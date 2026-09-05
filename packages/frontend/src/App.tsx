import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ME_QUERY, PRODUCTS_QUERY } from "./graphql/queries";
import { apolloClient } from "./apollo/client";
import { AuthModal, UserData } from "./components/AuthModal";
import { AdminProductModal } from "./components/AdminProductModal";
import {
  User,
  LogOut,
  Sparkles,
  ShoppingBag,
  Plus,
  Star,
  Package,
  Layers,
} from "lucide-react";

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  createdAt: string;
}

export function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAdminProductOpen, setIsAdminProductOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // 1. Auto-fetch current user profile with me query if token exists
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

  // 2. Fetch products catalog
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(PRODUCTS_QUERY);

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
    refetchProducts();
  };

  const products: ProductData[] = productsData?.products || [];
  const isAdmin = currentUser?.role === "ADMIN";

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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isAdmin && (
              <button
                onClick={() => setIsAdminProductOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "var(--primary)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            )}

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
                      backgroundColor: isAdmin ? "rgba(236, 72, 153, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: isAdmin ? "#f472b6" : "var(--success)",
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
      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
        {/* Banner */}
        <div
          style={{
            background: "linear-gradient(180deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.4) 100%)",
            padding: "36px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-card)",
            marginBottom: "36px",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "16px" }}>
            <Sparkles size={14} />
            <span>STEP 5 • ADMIN PRODUCT MANAGEMENT & REACT-HOOK-FORM + ZOD</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "10px", color: "var(--text-primary)" }}>
                Product Catalog & RBAC Control
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "640px", lineHeight: 1.6 }}>
                Admin users can create and publish new products via <code>react-hook-form</code> and <code>zod</code> schema validation. All GraphQL mutations are guarded with <strong>Role-Based Access Control</strong> (403 Forbidden for standard users).
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAdminProductOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 22px",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <Plus size={18} />
                <span>Create New Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={22} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Product Catalog</h3>
            <span style={{ fontSize: "0.85rem", padding: "3px 10px", borderRadius: "999px", backgroundColor: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
              {products.length} Products
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
            Loading catalog products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <Package size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>No products found</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {isAdmin ? "Click 'Create New Product' above to add products to your store." : "Check back later for new arrivals."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ position: "relative", width: "100%", height: "200px", backgroundColor: "var(--bg-main)" }}>
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(6px)",
                      color: "var(--accent)",
                    }}
                  >
                    {product.category}
                  </span>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{product.title}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 700 }}>
                      <Star size={14} fill="#fbbf24" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px", flex: 1 }}>
                    {product.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Price</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>${product.price.toFixed(2)}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Stock</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: product.stock > 0 ? "var(--success)" : "var(--danger)" }}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AdminProductModal
        isOpen={isAdminProductOpen}
        onClose={() => setIsAdminProductOpen(false)}
        onSuccess={() => refetchProducts()}
      />
    </div>
  );
}

export default App;
