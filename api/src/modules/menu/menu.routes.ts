import { Router } from 'express';
import * as MenuController from './menu.controller';
import * as ModifiersController from './modifiers.controller';
import * as UploadController from './upload.controller';
import { validateBody } from '../../middleware/validate';
import { categorySchema, menuItemSchema, variantSchema, modifierGroupSchema } from './menu.schema';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';
import { z } from 'zod';

const router = Router();

// ── PUBLIC — No auth (Customer QR App) ────────────────────────────────────────
router.get('/public/:outletSlug', MenuController.getPublicMenu);

// ── Protected — All routes below require auth ──────────────────────────────────
router.use(verifyToken);
router.use(requireActiveSubscription);


// Stats (plan limit bar)
router.get('/stats', MenuController.getMenuStats);

// Categories
router.get('/categories', MenuController.getCategories);
router.post('/categories',
  requireRole(['outlet_manager']),
  validateBody(categorySchema),
  MenuController.createCategory
);
router.patch('/categories/:id',
  requireRole(['outlet_manager']),
  MenuController.updateCategory
);
router.delete('/categories/:id',
  requireRole(['outlet_manager']),
  MenuController.deleteCategory
);

// Menu Items
router.get('/items', MenuController.getMenuItems);
router.post('/items',
  requireRole(['outlet_manager']),
  validateBody(menuItemSchema),
  MenuController.createMenuItem
);
router.patch('/items/:id',
  requireRole(['outlet_manager']),
  MenuController.updateMenuItem
);
router.delete('/items/:id',
  requireRole(['outlet_manager']),
  MenuController.deleteMenuItem
);

// Variants & Modifiers
router.post('/items/variants',
  requireRole(['outlet_manager']),
  validateBody(z.object({ menu_item_id: z.string().uuid(), variants: z.array(variantSchema) })),
  ModifiersController.addVariants
);
router.post('/items/modifier-groups',
  requireRole(['outlet_manager']),
  validateBody(modifierGroupSchema.extend({ menu_item_id: z.string().uuid() })),
  ModifiersController.addModifierGroup
);

// Uploads
router.get('/upload-url', requireRole(['outlet_manager', 'cashier']), UploadController.getUploadUrl);

export default router;
