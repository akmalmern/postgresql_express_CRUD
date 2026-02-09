// src/validators/profile.schema.js
const { z } = require("zod");

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  age: z.coerce.number().int().min(5).max(120).optional(),
});

const requestDeleteSchema = z.object({
  // ✅ foydalanuvchi tasdiqlash uchun parol so‘rasak ham bo‘ladi, lekin siz so‘ramadingiz
  email: z.string().email(),
});

const confirmDeleteSchema = z.object({
  email: z.string().email(),
  code: z.string().min(5).max(5),
});

module.exports = {
  updateProfileSchema,
  requestDeleteSchema,
  confirmDeleteSchema,
};
