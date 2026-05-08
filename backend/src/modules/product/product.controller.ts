import { Request, Response } from 'express';
import { productService } from './product.service';

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAll();
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await productService.getById(id);
      res.json({ success: true, data: product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await productService.update(id, req.body);
      res.json({ success: true, data: product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await productService.delete(id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
};