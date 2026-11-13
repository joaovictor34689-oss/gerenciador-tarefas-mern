const { Router } = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const requireAuth = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
router.use(requireAuth);

router.get('/', taskController.list);

router.post('/', [
  body('title').isString().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().toDate()
], validateRequest, taskController.create);

router.get('/:id', [
  param('id').isMongoId()
], validateRequest, taskController.getOne);

router.put('/:id', [
  param('id').isMongoId(),
  body('title').optional().isString().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().toDate()
], validateRequest, taskController.update);

router.delete('/:id', [
  param('id').isMongoId()
], validateRequest, taskController.remove);

module.exports = router;
