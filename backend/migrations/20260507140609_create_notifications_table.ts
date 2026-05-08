import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.string('type').notNullable();
    table.text('content');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('sent_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index(['user_id', 'is_read']);
    table.index(['product_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('notifications');
}
