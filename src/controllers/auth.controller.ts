import { NextFunction, Request, Response } from "express";
import { AuthInputSchema, ChangePasswordSchema, LoginSchema, refreshAccessTokenSchema, ResendRegistrationOTPSchema, VerifyOTPSchema } from "../validators/auth.validation";
import AuthService from "../services/auth.service";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = AuthInputSchema.parse(req.body);

    const response = await AuthService.register(validatedInput);

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const verifyRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await AuthService.verifyRegistration(VerifyOTPSchema.parse(req.body)));
  } catch (error) { next(error); }
};

const resendRegistrationOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await AuthService.resendRegistrationOTP(ResendRegistrationOTPSchema.parse(req.body)));
  } catch (error) { next(error); }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await AuthService.login(LoginSchema.parse(req.body));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await AuthService.getCurrentUser(req.user_id!);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = refreshAccessTokenSchema.parse(req.body);
    res.status(200).json(await AuthService.refresh(input.refreshToken));
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await AuthService.changePassword(req.user_id!, ChangePasswordSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  verifyRegistration,
  resendRegistrationOTP,
  login,
  me,
  refresh,
  changePassword,
};
