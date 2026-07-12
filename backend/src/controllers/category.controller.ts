import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/AppError";
import { createCategorySchema, updateCategorySchema } from "@/utils/validators/category.validator";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.assetCategory.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  try {
    const category = await prisma.assetCategory.create({ data: input });
    res.status(201).json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A category with this name already exists");
    }
    throw err;
  }
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateCategorySchema.parse(req.body);

  const existing = await prisma.assetCategory.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Category not found");

  try {
    const category = await prisma.assetCategory.update({ where: { id }, data: input });
    res.json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A category with this name already exists");
    }
    throw err;
  }
});
