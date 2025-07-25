export interface Account {
    id: number;
    user_id: number;
    account_number: string;
    account_name: string;
    bank: string;
    balance: number;
    created_at?: Date;
    updated_at?: Date;
  }
  