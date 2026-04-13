import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../utils/cloudinary.js';
import { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct, 
  deleteProduct, 
  getMyProducts
} from '../controllers/productController.js';

const router = Router();

router.post('/', authenticate, upload.array('images', 5), createProduct);
router.get('/', getAllProducts);
// Add this route - maybe at /products/me
router.get('/me', authenticate, getMyProducts);
router.get('/:id', getProductById);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;