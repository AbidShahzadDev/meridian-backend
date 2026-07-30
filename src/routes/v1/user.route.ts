import { Router } from "express";
import UserController from "../../controllers/user.controller";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth.middleware";
import { uploadProfileImage } from "../../middlewares/upload.middleware";

const userRouter = Router();

userRouter.put("/me/profile-image", authenticateJWT, uploadProfileImage, UserController.updateMyProfileImage);
userRouter.get("/", authenticateJWT, authorizeRoles("admin", "super_admin"), UserController.getUsers);
userRouter.post("/", authenticateJWT, authorizeRoles("admin", "super_admin"), UserController.createUser);
userRouter.put("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), UserController.updateUser);
userRouter.delete("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), UserController.deleteUser);

export default userRouter;
