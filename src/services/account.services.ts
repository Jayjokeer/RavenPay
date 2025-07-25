import axios from "axios";
import knex from "../db";

export const createAccount = async (userId:string,  accountNumber:string, accountName: string, bank: string) => {
    const [account] =  await knex('accounts').insert(
    { user_id: userId, account_number: accountNumber, account_name: accountName, bank },
    ['id', 'account_number', 'balance', 'account_name','bank']
  );
  return account;
};

export const isExsitingAccount = async (userId:string) => {
  return await knex('accounts').where({ user_id: userId }).first();
};

export const decreaseBalance = async (accountId:string, amount:number) => {
  return await knex('accounts').where({ id: accountId }).decrement('balance', amount);
};

export const  generateBankAccount = async (userData: any) =>{
    try {
      const response = await axios.post(`${process.env.RAVEN_URL}/pwbt/generate_account`, {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        amount: 100,
        email: userData.email
      }, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': `Bearer ${process.env.RAVEN_API_KEY_SECRET as string}`
        }
      })
      return response.data;
    } catch (error: any) {
      console.error('Raven Bank API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate bank account');
    } 
  };
export const fetchAccountByAccNumber = async (accountNumber: string)=>{
  return await knex('accounts').where({ account_number: accountNumber}).first();

}
