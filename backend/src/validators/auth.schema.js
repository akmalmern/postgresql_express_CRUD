// src/validators/auth.schema.js
const { z } = require("zod");

const studentSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.coerce.number().int().min(5).max(120),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
  newPassword: z.string().min(6),
});

module.exports = {
  studentSignupSchema,
  signinSchema,
  forgotSchema,
  resetSchema,
};
