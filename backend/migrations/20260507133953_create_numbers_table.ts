import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('numbers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('number').notNullable();
    table.string('status').defaultTo('available');
    table.uuid('user_id').references('id').inTable('users');
    table.timestamp('reserved_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['product_id', 'number']);
    table.index(['product_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('numbers');
}

