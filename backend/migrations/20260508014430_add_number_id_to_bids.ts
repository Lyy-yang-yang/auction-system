import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bids', (table) => {
    table.uuid('number_id').references('id').inTable('numbers');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bids', (table) => {
    table.dropColumn('number_id');
  });
}