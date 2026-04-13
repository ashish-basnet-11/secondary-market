import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../utils/cloudinary.js';
import { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct, 
  getMyProducts
} from '../controllers/productController.js';

const router = Router();

router.post('/', authenticate, upload.array('images', 5), createProduct);
router.get('/', getAllProducts);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
// Add this route - maybe at /products/me
router.get('/me', authenticate, getMyProducts);

export default router;