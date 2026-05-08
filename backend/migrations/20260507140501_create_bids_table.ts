import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bids', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.uuid('number_id').references('id').inTable('numbers');
    table.uuid('user_id').references('id').inTable('users').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('is_winning').defaultTo(false);
    
    table.index(['product_id', 'created_at']);
    table.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('bids');
}
