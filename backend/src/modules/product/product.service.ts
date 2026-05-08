import db from '../../config/database';

export interface ProductData {
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  bid_end_time: Date;
  total_stock?: number;
  min_bid_increment?: number;
}

export const productService = {
  async getAll() {
    return await db('products')
      .select('*')
      .orderBy('created_at', 'desc');
  },

  async getById(id: string) {
    const product = await db('products').where({ id }).first();
    if (!product) {
      throw new Error('Product not found');
    }

    const highestBid = await db('bids')
      .where({ product_id: id })
      .orderBy('amount', 'desc')
      .first();

    const availableCount = await db('numbers')
      .where({ product_id: id, status: 'available' })
      .count('* as count')
      .first();

    return {
      ...product,
      current_price: highestBid?.amount || product.base_price,
      available_stock: parseInt(availableCount?.count as string) || 0
    };
  },

  async create(data: ProductData) {
    const trx = await db.transaction();
    
    try {
      const [product] = await trx('products')
        .insert({
          ...data,
          current_price: data.base_price,
          available_stock: data.total_stock || 100
        })
        .returning('*');

      const numbers = [];
      for (let i = 1; i <= (data.total_stock || 100); i++) {
        numbers.push({
          product_id: product.id,
          number: i,
          status: 'available'
        });
      }
      
      await trx('numbers').insert(numbers);
      await trx.commit();
      
      return product;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  async update(id: string, data: Partial<ProductData>) {
    const [product] = await db('products')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  },

  async delete(id: string) {
    const deleted = await db('products').where({ id }).del();
    if (!deleted) {
      throw new Error('Product not found');
    }
    return true;
  }
};