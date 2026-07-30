import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";
import { CreateUserSchema, UpdateUserSchema } from "../validators/user.validation";
import { BadRequestError } from "../errors";

async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const response = await UserService.getUsers();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CreateUserSchema.parse(req.body);
    const response = await UserService.createUser(input, req.user_role!);
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      ...response,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const input = UpdateUserSchema.parse(req.body);
    const { id } = req.params;
    const response = await UserService.updateUser(id, input, req.user_id!, req.user_role!);
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      ...response,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const response = await UserService.deleteUser(id, req.user_id!, req.user_role!);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      ...response,
    });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfileImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new BadRequestError("A profileImage file is required");
    const response = await UserService.updateProfileImage(req.user_id!, req.file);
    res.status(200).json({ success: true, message: "Profile image updated successfully", ...response });
  } catch (error) {
    next(error);
  }
}

export default { getUsers, createUser, updateUser, deleteUser, updateMyProfileImage };
