import knex from "../db";

export const createTransaction = async (transactionPayload: any) => {
  const [transaction] = await knex('transactions').insert(
    transactionPayload,
    ['id', 'amount', 'type','description', 'account_id', 'status', 'reference', 'user_id']
  );
  return transaction;
};

export const fetchTransactions = async (userId: string) => {
  return await knex('transactions').where({ user_id: userId }).orderBy('created_at', 'desc');
};