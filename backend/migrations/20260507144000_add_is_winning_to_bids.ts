import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bids', (table) => {
    table.boolean('is_winning').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bids', (table) => {
    table.dropColumn('is_winning');
  });
}