import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { validateBody } from '../lib/yantr/zod-middleware';
import { 
  createUsersSchema, 
  updateUsersSchema 
} from '../controllers/users.controller';

const router = Router();

/**
 * Users Routes
 * 
 * GET    /api/users      - Get all userss
 * GET    /api/users/:id  - Get users by ID
 * POST   /api/users      - Create users
 * PUT    /api/users/:id  - Update users
 * DELETE /api/users/:id  - Delete users
 */

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', validateBody(createUsersSchema), usersController.create);
router.put('/:id', validateBody(updateUsersSchema), usersController.update);
router.delete('/:id', usersController.remove);

export default router;
