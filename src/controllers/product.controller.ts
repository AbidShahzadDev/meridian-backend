import { NextFunction, Request, Response } from "express";
import ProductService from "../services/product.service";
import { CreateProductSchema, UpdateProductSchema } from "../validators/product.validation";

async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CreateProductSchema.parse(req.body);
    const response = await ProductService.createProduct(input);
    res.status(201).json({ success: true, message: "Product created successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await ProductService.getProducts(req.query);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await ProductService.getProductById(id);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const input = UpdateProductSchema.parse(req.body);
    const response = await ProductService.updateProduct(id, input);
    res.status(200).json({ success: true, message: "Product updated successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await ProductService.deleteProduct(id);
    res.status(200).json({ success: true, message: "Product deleted successfully", ...response });
  } catch (error) {
    next(error);
  }
}

async function updateProductImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files ?? {}) as { featuredImage?: Express.Multer.File[]; gallery?: Express.Multer.File[] };
    const replaceGallery = req.body.replaceGallery === "true";
    const response = await ProductService.updateProductImages(req.params.id, files, replaceGallery);
    res.status(200).json({ success: true, message: "Product images updated successfully", ...response });
  } catch (error) {
    next(error);
  }
}

export default { createProduct, getProducts, getProduct, updateProduct, deleteProduct, updateProductImages };
