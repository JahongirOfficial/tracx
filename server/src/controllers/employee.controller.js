const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getEmployees = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const businessmanId = req.user.id;

  const where = { businessmanId };
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, fullName: true, phone: true,
        position: true, permissions: true, isActive: true, createdAt: true,
      },
    }),
    prisma.employee.count({ where }),
  ]);

  res.json({
    success: true,
    data: employees,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

const getEmployee = catchAsync(async (req, res, next) => {
  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!employee) return next(new AppError('Xodim topilmadi', 404));
  res.json({ success: true, data: employee });
});

const createEmployee = catchAsync(async (req, res, next) => {
  const { username, password, fullName, phone, position, permissions = [] } = req.body;

  const existing = await prisma.employee.findUnique({ where: { username } });
  if (existing) return next(new AppError('Bu username band', 400));

  const hashed = await bcrypt.hash(password, 12);
  const employee = await prisma.employee.create({
    data: {
      businessmanId: req.user.id,
      username,
      password: hashed,
      fullName,
      phone: phone || null,
      position: position || null,
      permissions,
    },
  });

  const { password: _, ...safe } = employee;
  res.status(201).json({ success: true, data: safe });
});

const updateEmployee = catchAsync(async (req, res, next) => {
  const { fullName, phone, position, permissions, isActive } = req.body;

  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!employee) return next(new AppError('Xodim topilmadi', 404));

  const updated = await prisma.employee.update({
    where: { id: req.params.id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(position !== undefined && { position }),
      ...(permissions !== undefined && { permissions }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  const { password: _, ...safe } = updated;
  res.json({ success: true, data: safe });
});

const deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!employee) return next(new AppError('Xodim topilmadi', 404));
  await prisma.employee.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Xodim o'chirildi" });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return next(new AppError("Parol kamida 6 ta belgi bo'lishi kerak", 400));
  }

  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!employee) return next(new AppError('Xodim topilmadi', 404));

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.employee.update({ where: { id: req.params.id }, data: { password: hashed } });
  res.json({ success: true, message: 'Parol yangilandi' });
});

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, changePassword };
