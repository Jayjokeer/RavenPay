import { Router, Request, Response } from "express";
import * as authController from "../controller/auth.controller";
import { validateLogin, validateRegistration } from "../validation/auth.validation";


const router = Router();

router.route("/").get((req: Request, res: Response) => {
  res.json({ message: "Welcome to RavenPay" });
});
//unprotected routes
router.route("/sign-up").post(validateRegistration,authController.registerUserController);
router.route("/login").post(validateLogin,authController.loginController);

export { router as AuthRoute };
