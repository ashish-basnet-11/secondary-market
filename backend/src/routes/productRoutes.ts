import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../utils/cloudinary.js';
import { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = Router();

router.post('/', authenticate, upload.array('images', 5), createProduct);
router.get('/', getAllProducts);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;