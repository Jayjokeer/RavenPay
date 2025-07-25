import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/error";
import { catchAsync } from "../errors/error-handler";
import { successResponse } from "../helpers/success-response";
import { comparePassword, hashPassword } from "../utils/encryption";
import { NextFunction, Request, Response } from "express";
import { generateJWTwithExpiryDate } from "../utils/jwt";
import * as authService from "../services/auth.service";
import * as accountService from "../services/account.services";
import { JwtPayload } from "jsonwebtoken";


export const generateAccountController = catchAsync( async (req: JwtPayload, res: Response): Promise<void> => {
    const email= req.user.email;
  
    try {
      const existingAccount = await accountService.isExsitingAccount(email);
      if (existingAccount) {
        throw new BadRequestError('Account already exists');
      }
  const user = await authService.checkEmailExists(email);
    const accountDetails =  await accountService.generateBankAccount({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email
    })
        const {account_number, account_name, bank} = accountDetails.data;
    const account =  await accountService.createAccount(req.user.id, account_number, account_name, bank);  
       successResponse(res,StatusCodes.CREATED, account);
    } catch (error) {
      console.error('Error creating account:', error);
    throw new BadRequestError('Internal server error');
    }
  });

