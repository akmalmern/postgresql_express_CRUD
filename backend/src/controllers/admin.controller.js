const prisma = require("../prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { safeUnlink } = require("../utils/file");
const { ok } = require("../utils/respond");

exports.listStudents = asyncHandler(async (req, res) => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      age: true,
      imagePath: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(req, res, { students }); // message kerak emas
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "STUDENT") {
    throw new AppError("NOT_FOUND", 404, { code: "NOT_FOUND" });
  }

  safeUnlink(student.imagePath);

  await prisma.user.delete({ where: { id } });

  return ok(req, res, {}, "STUDENT_DELETED");
});
