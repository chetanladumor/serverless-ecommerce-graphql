import { useMutation } from "@apollo/client";
import {
  UPDATE_CART_ITEM_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  CLEAR_CART_MUTATION,
} from "../graphql/mutations";
import { CART_QUERY } from "../graphql/queries";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

export interface CartProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
}

export interface CartItemData {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
}

export interface CartPayloadData {
  totalItems: number;
  subtotal: number;
  items: CartItemData[];
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartPayloadData | null;
  loading: boolean;
  onCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 1000;

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  loading,
  onCheckout,
}: CartDrawerProps) {
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }],
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }],
  });

  const [clearCart] = useMutation(CLEAR_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }],
  });

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const totalItems = cart?.totalItems || 0;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleUpdateQty = (cartItemId: string, newQty: number) => {
    updateCartItem({
      variables: {
        input: {
          cartItemId,
          quantity: newQty,
        },
      },
    });
  };

  const handleRemove = (cartItemId: string) => {
    removeFromCart({
      variables: { cartItemId },
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)",
          position: "relative",
          animation: "slideLeft 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={22} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Your Shopping Cart</h3>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                color: "var(--primary)",
                fontWeight: 700,
              }}
            >
              {totalItems} items
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.25rem" }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--bg-main)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            <Truck size={14} style={{ color: "var(--accent)" }} />
            {remainingForFreeShipping > 0 ? (
              <span>
                Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for <strong>FREE Express Shipping</strong>
              </span>
            ) : (
              <span style={{ color: "var(--success)", fontWeight: 700 }}>
                🎉 You qualified for FREE Express Shipping!
              </span>
            )}
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressToFreeShipping}%`,
                background: "linear-gradient(90deg, var(--primary), var(--accent))",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              Loading cart items...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-main)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--text-muted)",
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>Your cart is empty</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "20px" }}>
                Browse our product catalog and add some amazing tech to your cart!
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "14px",
                    backgroundColor: "var(--bg-main)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.title}
                    style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80";
                    }}
                  />

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {item.product?.title}
                        </h4>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          ${item.product?.price.toFixed(2)} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        style={{
                          background: "transparent",
                          color: "var(--text-muted)",
                          padding: "4px",
                          borderRadius: "4px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          backgroundColor: "var(--bg-card)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          padding: "2px",
                        }}
                      >
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          style={{
                            width: "26px",
                            height: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "transparent",
                            color: "var(--text-primary)",
                          }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ padding: "0 10px", fontSize: "0.875rem", fontWeight: 700 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 999)}
                          style={{
                            width: "26px",
                            height: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "transparent",
                            color: "var(--text-primary)",
                            opacity: item.quantity >= (item.product?.stock || 999) ? 0.4 : 1,
                          }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--primary)" }}>
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-main)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Shipping</span>
              <span style={{ fontSize: "0.85rem", color: remainingForFreeShipping === 0 ? "var(--success)" : "var(--text-secondary)", fontWeight: 600 }}>
                {remainingForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}
              </span>
            </div>

            <button
              onClick={onCheckout}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "var(--shadow-glow)",
                marginBottom: "10px",
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <button
                onClick={() => clearCart()}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  textDecoration: "underline",
                }}
              >
                Clear Entire Cart
              </button>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <ShieldCheck size={14} style={{ color: "var(--success)" }} />
                <span>Secure 256-bit SSL Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
