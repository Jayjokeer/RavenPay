import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('accounts', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('account_number').unique().notNullable();
      table.decimal('balance', 15, 2).defaultTo(0);
      table.string('account_name').unique().notNullable();
      table.string('bank').notNullable();
      table.timestamps(true, true);
    });
  }
  
  export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('accounts');
  }

