import { Request, Response } from 'express';
import knex from '../db';
import axios from 'axios';
import { JwtPayload } from 'jsonwebtoken';
import * as accountService from '../services/account.services';
import { BadRequestError, NotFoundError } from '../errors/error';
import * as transactionService from '../services/transaction.services';
import { TransactionStatus, TransactionType } from '../enum/transaction.enum';
import { StatusCodes } from 'http-status-codes';
import { successResponse } from '../helpers/success-response';
import { catchAsync } from '../errors/error-handler';
import * as authService from '../services/auth.service';
const RAVEN_API_KEY_SECRET = process.env.RAVEN_API_KEY_SECRET;

export const transferMoneyController = catchAsync( async (req: JwtPayload, res: Response) => {
  const { user } = req as any;
  const { recipientAccount, amount, description } = req.body;

  try {
    const account = await accountService.isExsitingAccount(user.id);

    if (!account) {
        throw new NotFoundError('Account not found');
    }

    if (account.balance < amount) {
        throw new BadRequestError('Insufficient balance');
    }

    const response = await axios.post(
        `${process.env.RAVEN_URL}/transfers/create`,
      {
        fromAccount: account.account_number,
        toAccount: recipientAccount,
        amount,
        description,
      },
      {
        headers: { Authorization: `Bearer ${RAVEN_API_KEY_SECRET}` },
      }
    );
    await accountService.decreaseBalance(account.id, amount);
    await transactionService.createTransaction({account_id: account.id, amount, description, type:TransactionType.TRANSFER, status: TransactionStatus.SUCCESS, reference: response.data.reference, user_id: user.id});    

   return successResponse(res,StatusCodes.CREATED, "Transfer Successful");
} catch (error) {
    console.error('Error processing transfer:', error);
    throw new BadRequestError('Internal server error');}
});

export  const  depositMoneyController = catchAsync( async (req: JwtPayload, res: Response)=> {
try {
    const { amount} = req.body;

    const userAccount = await accountService.isExsitingAccount(req.user.id);
    const user = await authService.checkEmailExists(req.user.email);
    if (!userAccount ) {
        throw new NotFoundError('Account not found');
    }
    const merchant_ref = `DEP${Date.now()}${user.id}`;

    const paymentResponse = await axios.post(
      `${process.env.RAVEN_URL}/transfers/create`,
      {
        customer_email: user.email,
        amount: parseFloat(amount),
        description: 'Deposit to account',
        merchant_ref,
        payment_methods: 'bank_transfer',
        bank: userAccount.bank,
        bank_code: 44,
        webhook_url: 'https://webhook.site/514cc749-9fab-44b4-bf90-caa4e26e2961'
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': `Bearer ${process.env.RAVEN_API_KEY_SECRET}`
        }
      }
    );
    console.log(paymentResponse)
   const transaction = {
        account_id: userAccount.id,
        user_id: user.id,
        type: TransactionType.DEPOSIT,
        amount: parseFloat(amount),
        description: 'Bank transfer deposit',
        status: TransactionStatus.PENDING,
        reference: `DEP${Date.now()}${user.id}`
      }
      await transactionService.createTransaction(transaction);
    const data = {  
        payment_details: {
            payment_reference: paymentResponse.data.data.trx_ref,
            payment_url: paymentResponse.data.data.link,
            amount: amount,
            merchant_ref,
            status: paymentResponse.data.status
          }
    };
   return successResponse(res,StatusCodes.OK, data);

  } catch (error: any) {
    console.error('Deposit generation error:', error);
    throw new BadRequestError('Internal server error');
  }
});

export const fetchTransactionsController = catchAsync(async (req: JwtPayload, res: Response) => {
  const userId = req.user.id;

  try {
    const transactions = await transactionService.fetchTransactions(userId);
    return successResponse(res, StatusCodes.OK, transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new BadRequestError('Internal server error');
  }
});

