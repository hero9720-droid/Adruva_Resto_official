import { Router } from 'express';
import * as RecipeController from './recipe.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

router.post('/', requireRole(['outlet_manager']), RecipeController.createRecipe);
router.get('/:menuItemId', RecipeController.getRecipe);

export default router;
