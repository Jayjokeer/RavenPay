import { Router, Request, Response } from "express";
import * as accountController from "../controller/account.controller";
import { userAuth } from "../middleware/authorization";

const router = Router();

router.route("/generate").post(userAuth,accountController.generateAccountController);

export { router as AccountRoute };
