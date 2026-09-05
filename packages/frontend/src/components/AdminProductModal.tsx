import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client";
import { CREATE_PRODUCT_MUTATION } from "../graphql/mutations";
import { PRODUCTS_QUERY } from "../graphql/queries";
import { X, PlusCircle, AlertCircle, Sparkles, Image as ImageIcon } from "lucide-react";

// 1. Define Zod Validation Schema
const productFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(120, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z
    .number({ message: "Price must be a valid number" })
    .positive("Price must be greater than $0"),
  category: z
    .string()
    .min(1, "Please select a category"),
  imageUrl: z
    .string()
    .url("Please enter a valid HTTP/HTTPS image URL"),
  stock: z
    .number({ message: "Stock must be a number" })
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ["Smartphones", "Laptops", "Audio", "Tablets", "Wearables", "Gaming"];

export function AdminProductModal({ isOpen, onClose, onSuccess }: AdminProductModalProps) {
  const [serverError, setServerError] = useState("");

  // 2. Initialize React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 99.99,
      category: "Smartphones",
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
      stock: 25,
    },
  });

  const previewImage = watch("imageUrl");

  const [createProduct, { loading: mutationLoading }] = useMutation(CREATE_PRODUCT_MUTATION, {
    refetchQueries: [{ query: PRODUCTS_QUERY }],
    onCompleted: () => {
      reset();
      onSuccess();
      onClose();
    },
    onError: (err) => {
      setServerError(err.message || "Failed to create product");
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: ProductFormValues) => {
    setServerError("");
    createProduct({
      variables: {
        input: {
          title: data.title.trim(),
          description: data.description.trim(),
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl.trim(),
          stock: data.stock,
        },
      },
    });
  };

  const isBusy = isSubmitting || mutationLoading;

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
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div
            style={{
              padding: "10px",
              borderRadius: "var(--radius-md)",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary)",
              display: "flex",
            }}
          >
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Create New Product</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700 }}>
              <Sparkles size={12} />
              <span>POWERED BY REACT-HOOK-FORM + ZOD</span>
            </div>
          </div>
        </div>

        {serverError && (
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
              margin: "16px 0",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: "20px" }}>
          {/* Title */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Product Title *
            </label>
            <input
              {...register("title")}
              placeholder="e.g. Sony WH-1000XM5"
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "var(--bg-main)",
                border: `1px solid ${errors.title ? "var(--danger)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            {errors.title && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.title.message}</p>}
          </div>

          {/* Category & Price Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Category *
              </label>
              <select
                {...register("category")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-main)",
                  border: `1px solid ${errors.category ? "var(--danger)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.category.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="299.99"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-main)",
                  border: `1px solid ${errors.price ? "var(--danger)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              {errors.price && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.price.message}</p>}
            </div>
          </div>

          {/* Stock & Image URL Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Stock Units *
              </label>
              <input
                type="number"
                {...register("stock", { valueAsNumber: true })}
                placeholder="50"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-main)",
                  border: `1px solid ${errors.stock ? "var(--danger)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              {errors.stock && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.stock.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Image URL *
              </label>
              <input
                type="url"
                {...register("imageUrl")}
                placeholder="https://images.unsplash.com/..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-main)",
                  border: `1px solid ${errors.imageUrl ? "var(--danger)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              {errors.imageUrl && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.imageUrl.message}</p>}
            </div>
          </div>

          {/* Image Preview Banner */}
          {previewImage && !errors.imageUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "14px" }}>
              <img
                src={previewImage}
                alt="Product Preview"
                style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-primary)", fontWeight: 600 }}>
                  <ImageIcon size={14} />
                  <span>Live Image Preview</span>
                </div>
                <span>Ready to attach to catalog</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Detailed description of features, specs, and benefits..."
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "var(--bg-main)",
                border: `1px solid ${errors.description ? "var(--danger)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                outline: "none",
                resize: "vertical",
              }}
            />
            {errors.description && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "4px" }}>{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isBusy}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              borderRadius: "var(--radius-sm)",
              opacity: isBusy ? 0.7 : 1,
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {isBusy ? "Publishing Product..." : "Publish Product to Catalog"}
          </button>
        </form>
      </div>
    </div>
  );
}
