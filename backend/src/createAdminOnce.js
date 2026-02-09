require("dotenv").config();
const prisma = require("./prisma");
const bcrypt = require("bcrypt");

(async () => {
  const email = "admin@example.com";
  const password = "admin123";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: "Admin",
      lastName: "One",
      role: "ADMIN",
      // ✅ admin image optional, hozircha null
    },
  });

  console.log("✅ Admin created:", email, password);
  process.exit(0);
})();
