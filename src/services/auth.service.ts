import knex from "../db";

export const checkEmailExists = async (email: string) => {
return await knex('users').where({ email }).first();
};

export const createUser = async (userPayload: any) => {
const [user] = await knex('users').insert(
    userPayload,
        ['id', 'first_name', 'email','last_name', 'phone']
      );(user);

      return user;
};

export const fetchUserById = async (id: number)=>{
return await knex('users').where({ id }).first();
}