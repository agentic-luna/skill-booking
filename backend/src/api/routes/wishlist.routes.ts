import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/authorize';
import { SystemPermissions } from '../../security/system.permissions';

const router = Router();

router.use(authenticate as any);
router.use(requirePermission(SystemPermissions.CLIENT_WISHLIST_MANAGE) as any);

router.get('/', WishlistController.getWishlist as any);
router.post('/', WishlistController.addToWishlist as any);
router.delete('/:eventId', WishlistController.removeFromWishlist as any);

export default router;
