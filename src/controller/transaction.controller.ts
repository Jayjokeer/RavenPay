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

export const transferMoneyController = catchAsync( async (req: JwtPayload, res: Response): Promise<void> => {
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

    successResponse(res,StatusCodes.CREATED, "Transfer Successful");
} catch (error) {
    console.error('Error processing transfer:', error);
    throw new BadRequestError('Internal server error');}
});

export  const  depositMoneyController = catchAsync( async (req: JwtPayload, res: Response): Promise<void> => {
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
    successResponse(res,StatusCodes.OK, data);

  } catch (error: any) {
    console.error('Deposit generation error:', error);
    throw new BadRequestError('Internal server error');
  }
});

export const transferWebhook = catchAsync(async (req: Request, res: Response): Promise<void> => {
try {  
     const { 
      type, 
      amount, 
      session_id, 
      account_number, 
      source 
    } = req.body;

    if (req.body.secret !== process.env.WEBHOOK_SECRET) {
  throw new  BadRequestError("Invalid webhook secret");
 }


  const account = await accountService.fetchAccountByAccNumber(account_number);
  const user = await authService.fetchUserById(account.user_id);

    if (!user) {
      throw new NotFoundError("User not found");
    };
    account
    
    // await db.transaction(async trx => {
    //   // Create transaction record
    //   await trx('transactions').insert({
    //     user_id: user.id,
    //     session_id,
    //     type: 'deposit',
    //     amount,
    //     source_account: source.account_number,
    //     source_bank: source.bank,
    //     source_bank_code: source.bank_code,
    //     narration: source.narration,
    //     status: 'completed'
    //   });

    //   // Update user balance
    //   await trx('users')
    //     .where('id', user.id)
    //     .increment('balance', amount);
    // });
  
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(200).json({ status: 'processed with errors' });
    }
  });

//   try {
//     const { 
//       amount, 
//       destination_account, 
//       destination_bank_code,
//       narration 
//     } = req.body;

//     const user = req.user; // Assuming authentication middleware

//     // Check balance
//     if (user.balance < amount) {
//       return res.status(400).json({ error: 'Insufficient balance' });
//     }

//     // Call Raven Atlas API
//     const response = await axios.post(
//       'https://api.getravenbank.com/v1/transfers/bank',
//       {
//         amount,
//         account_number: destination_account,
//         bank_code: destination_bank_code,
//         narration
//       },
//       {
//         headers: { 'Authorization': `Bearer ${process.env.RAVEN_SECRET_KEY}` }
//       }
//     );

//     // Begin transaction
//     await db.transaction(async trx => {
//       // Create transaction record
//       await trx('transactions').insert({
//         user_id: user.id,
//         session_id: response.data.session_id,
//         type: 'transfer',
//         amount,
//         destination_account,
//         destination_bank_code,
//         narration,
//         status: 'pending'
//       });

//       // Deduct from user balance
//       await trx('users')
//         .where('id', user.id)
//         .decrement('balance', amount);
//     });

//     res.status(200).json({ 
//       message: 'Transfer initiated',
//       session_id: response.data.session_id 
//     });
//   } catch (error) {
//     console.error('Transfer error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // src/routes/transactionRoutes.js
// router.get('/transactions', async (req, res) => {
//   try {
//     const user = req.user; // Assuming authentication middleware
    
//     const transactions = await db('transactions')
//       .where('user_id', user.id)
//       .orderBy('created_at', 'desc');

//     res.status(200).json(transactions);
//   } catch (error) {
//     console.error('Transaction fetch error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });