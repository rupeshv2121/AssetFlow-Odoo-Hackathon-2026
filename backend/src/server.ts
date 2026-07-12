import dotenv from "dotenv";
dotenv.config();

import app from "@/app";
import { prisma } from "@/config/prisma";

const PORT = process.env.PORT || 5000;

async function main() {
  await prisma.$connect();
  console.log("Connected to PostgreSQL via Prisma");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
