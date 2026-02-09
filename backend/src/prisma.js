// src/prisma.js
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// ✅ Prisma 7: adapter yoki accelerateUrl shart!
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
