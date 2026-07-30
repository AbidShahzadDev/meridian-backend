import { NextFunction, Request, Response } from "express";
import CategoryService from "../services/category.service";
import { CreateCategorySchema, UpdateCategorySchema } from "../validators/category.validation";

async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CreateCategorySchema.parse(req.body);
    const response = await CategoryService.createCategory(input);
    res.status(201).json({ success: true, message: "Category created successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const response = await CategoryService.getCategories();
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await CategoryService.getCategoryById(id);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const input = UpdateCategorySchema.parse(req.body);
    const response = await CategoryService.updateCategory(id, input);
    res.status(200).json({ success: true, message: "Category updated successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await CategoryService.deleteCategory(id);
    res.status(200).json({ success: true, message: "Category deleted successfully", ...response });
  } catch (error) {
    next(error);
  }
}

export default { createCategory, getCategories, getCategory, updateCategory, deleteCategory };
