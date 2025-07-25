import { TransactionStatus, TransactionType } from "../enum/transaction.enum";

export interface Transaction {
    id: number;
    account_id: number;
    user_id: number;
    status: TransactionStatus;
    type: TransactionType;
    amount: number;
    reference: string;
    description: string;
    created_at?: Date;
    updated_at?: Date;
  };
  