import { Router, type Request, type Response } from 'express';
import prisma from '../prisma.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// POST /products — create a product listing (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const sellerId: number = res.locals.userId;
    const { title, description, price, originalPrice, condition, categoryId } = req.body;

    if (!title || !description || price === undefined || !condition || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : null,
        condition,
        sellerId,
        categoryId: Number(categoryId),
      },
      include: { category: true, seller: { select: { id: true, username: true, email: true } } },
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /products — fetch all products (public)
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /products/:id — update a product (protected, owner only)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const sellerId: number = res.locals.userId;
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (existing.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Forbidden: you do not own this product' });
    }

    const { title, description, price, originalPrice, condition, categoryId } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(condition !== undefined && { condition }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      },
      include: { category: true, seller: { select: { id: true, username: true, email: true } } },
    });

    return res.status(200).json({ product: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /products/:id — delete a product (protected, owner only)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const sellerId: number = res.locals.userId;
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (existing.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Forbidden: you do not own this product' });
    }

    await prisma.product.delete({ where: { id: productId } });

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
