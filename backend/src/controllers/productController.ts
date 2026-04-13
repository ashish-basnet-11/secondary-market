import { type Request, type Response } from 'express';
import prisma from '../prisma.js';
import { cloudinary } from '../utils/cloudinary.js';

export const createProduct = async (req: Request, res: Response) => {
  const uploadedImages: string[] = [];
  try {
    const sellerId: number = res.locals.userId;
    const { title, description, price, originalPrice, condition, categoryId } = req.body;

    const files = req.files as Express.Multer.File[];
    if (files) {
      files.forEach(file => uploadedImages.push(file.path));
    }

    if (!title || !description || price === undefined || !condition || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : null,
        condition: Number(condition),
        sellerId,
        categoryId: Number(categoryId),
        images: uploadedImages,
      },
      include: { category: true, seller: { select: { id: true, username: true, email: true } } },
    });

    return res.status(201).json({ product });
  } catch (error) {
    for (const url of uploadedImages) {
      const publicId = url.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`secondary-market-products/${publicId}`);
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
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
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const sellerId: number = res.locals.userId;
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    if (existing.sellerId !== sellerId) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, price, originalPrice, condition, categoryId } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(condition !== undefined && { condition: Number(condition) }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      },
      include: { category: true, seller: { select: { id: true, username: true, email: true } } },
    });

    return res.status(200).json({ product: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const sellerId: number = res.locals.userId;
    const productId = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    if (existing.sellerId !== sellerId) return res.status(403).json({ error: 'Forbidden' });

    // Bonus: You could add logic here to delete images from Cloudinary before deleting from DB
    await prisma.product.delete({ where: { id: productId } });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};