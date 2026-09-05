import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create or ensure Admin user exists
  const adminEmail = "admin@gmail.com";
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", password: hashedPassword, name: "Admin" },
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`👤 Admin ready: ${admin.email} (Role: ${admin.role})`);

  // 2. Seed initial sample products
  const sampleProducts = [
    {
      title: "Apple iPhone 16 Pro Max",
      description: "Titanium design with A18 Pro chip, 48MP Fusion camera system, and industry-leading battery life.",
      price: 1199.99,
      category: "Smartphones",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      stock: 45,
      rating: 4.9,
    },
    {
      title: "Sony WH-1000XM5 Wireless Headphones",
      description: "Industry-leading noise canceling with two processors and 8 microphones for exceptional sound quality.",
      price: 399.99,
      category: "Audio",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      stock: 60,
      rating: 4.8,
    },
    {
      title: "MacBook Pro 16\" M3 Max",
      description: "The most powerful MacBook Pro ever with liquid retina XDR display and 36GB unified memory.",
      price: 2499.0,
      category: "Laptops",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      stock: 25,
      rating: 5.0,
    },
  ];

  for (const prod of sampleProducts) {
    const existing = await prisma.product.findFirst({
      where: { title: prod.title },
    });
    if (!existing) {
      await prisma.product.create({ data: prod });
      console.log(`📦 Seeded product: ${prod.title}`);
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
