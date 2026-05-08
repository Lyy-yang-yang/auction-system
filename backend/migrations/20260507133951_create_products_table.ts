import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description');
    table.string('image_url');
    table.decimal('base_price', 10, 2).notNullable();
    table.decimal('current_price', 10, 2);
    table.integer('total_stock').defaultTo(100);
    table.integer('available_stock').defaultTo(100);
    table.decimal('min_bid_increment', 10, 2).defaultTo(1.00);
    table.timestamp('bid_end_time').notNullable();
    table.string('status').defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('status');
    table.index('bid_end_time');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('products');
}

