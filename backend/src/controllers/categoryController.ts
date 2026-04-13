import { type Request, type Response } from 'express';
import prisma from '../prisma.js';

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};