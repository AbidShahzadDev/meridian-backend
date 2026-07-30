import { Router } from "express";
import AuthController from "../../controllers/auth.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { rateLimit } from "express-rate-limit";

const authRouter = Router();
const registrationLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many registration attempts. Please try again later.", errors: [] },
});

authRouter.get("/", (req, res) => {
  res.send("Hit auth route");
});

authRouter.post("/register", registrationLimiter, AuthController.register);
authRouter.post("/register/verify", AuthController.verifyRegistration);
// Compatibility aliases for frontends that use a shorter verification path.
authRouter.post("/verify-otp", AuthController.verifyRegistration);
authRouter.post("/register/verify-otp", AuthController.verifyRegistration);
authRouter.post("/register/resend-otp", registrationLimiter, AuthController.resendRegistrationOTP);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh", AuthController.refresh);
authRouter.get("/me", authenticateJWT, AuthController.me);
authRouter.put("/me/password", authenticateJWT, AuthController.changePassword);

export default authRouter;
