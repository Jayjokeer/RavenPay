import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('transactions', (table) => {
      table.increments('id').primary();
      table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE');
      table.string('type').notNullable(); // 'deposit', 'transfer', 'withdrawal'
      table.decimal('amount', 15, 2).notNullable();
      table.string('reference').notNullable();
      table.string('description').notNullable();
      table.string('status').notNullable();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');

      table.timestamps(true, true);
    });
  }
  
  export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('transactions');
  }
