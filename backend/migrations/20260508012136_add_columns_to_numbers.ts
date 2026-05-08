import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('numbers', (table) => {
    table.decimal('current_bid', 10, 2);
    table.uuid('current_bid_user_id').references('id').inTable('users');
    table.uuid('winner_user_id').references('id').inTable('users');
    table.decimal('final_price', 10, 2);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('numbers', (table) => {
    table.dropColumn('current_bid');
    table.dropColumn('current_bid_user_id');
    table.dropColumn('winner_user_id');
    table.dropColumn('final_price');
  });
}

