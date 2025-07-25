import knex from "../db";

export const createTransaction = async (transactionPayload: any) => {
  const [transaction] = await knex('transactions').insert(
    transactionPayload,
    ['id', 'amount', 'type','description', 'account_id', 'status', 'reference', 'user_id']
  );
  return transaction;
};

