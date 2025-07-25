import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/error";
import { catchAsync } from "../errors/error-handler";
import { successResponse } from "../helpers/success-response";
import { comparePassword, hashPassword } from "../utils/encryption";
import { NextFunction, Request, Response } from "express";
import { generateJWTwithExpiryDate } from "../utils/jwt";
import * as authService from "../services/auth.service";
export const registerUserController = catchAsync( async (req: Request, res: Response) => {
   try{
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
    } = req.body;

    const isEmailExists = await authService.checkEmailExists(email);
    if(isEmailExists) throw new BadRequestError("User with email already exists!");

    const encryptPwd = await hashPassword(password);

    const userPayload= {
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptPwd,
      phone
    }
    const user = await authService.createUser(userPayload);

      const data = user;
      return successResponse(res,StatusCodes.CREATED, data);
    }catch(error){
        console.error('Error during user registration:', error);
        throw new BadRequestError("Internal server error");
    }
});

export const loginController = catchAsync( async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await authService.checkEmailExists(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }
  
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError('Invalid email or password');
      }
  
      const token =  generateJWTwithExpiryDate(user);
  
       successResponse(res, StatusCodes.OK, token);
    } catch (error) {
      console.error('Error during login:', error);
      throw new BadRequestError('Internal server error')
      ;}
  });