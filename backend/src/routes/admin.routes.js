const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/role");

const adminController = require("../controllers/admin.controller");

// ✅ Admin: list all students
router.get(
  "/students",
  auth,
  requireRole("ADMIN"),
  adminController.listStudents,
);

// ✅ Admin: delete student
router.delete(
  "/students/:id",
  auth,
  requireRole("ADMIN"),
  adminController.deleteStudent,
);

module.exports = router;
