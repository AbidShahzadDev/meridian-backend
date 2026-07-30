import { NextFunction, Request, Response } from "express";
import BrandService from "../services/brand.service";
import { CreateBrandSchema, UpdateBrandSchema } from "../validators/brand.validation";

async function createBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CreateBrandSchema.parse(req.body);
    const response = await BrandService.createBrand(input);
    res.status(201).json({ success: true, message: "Brand created successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function getBrands(_req: Request, res: Response, next: NextFunction) {
  try {
    const response = await BrandService.getBrands();
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function getBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await BrandService.getBrandById(id);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function updateBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const input = UpdateBrandSchema.parse(req.body);
    const response = await BrandService.updateBrand(id, input);
    res.status(200).json({ success: true, message: "Brand updated successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function deleteBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await BrandService.deleteBrand(id);
    res.status(200).json({ success: true, message: "Brand deleted successfully", ...response });
  } catch (error) {
    next(error);
  }
}

export default { createBrand, getBrands, getBrand, updateBrand, deleteBrand };
