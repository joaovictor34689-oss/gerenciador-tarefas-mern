const { Router } = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const requireAuth = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
router.use(requireAuth);

router.get('/', taskController.list);

router.post(
  '/',
  [
    body('title')
      .isString()
      .bail()
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Informe um título de até 100 caracteres.'),
    body('description').optional().isString().bail().isLength({ max: 500 }),
    body('status').optional().isString().bail().isIn(['pending', 'completed']),
    body('priority').optional().isString().bail().isIn(['low', 'medium', 'high']),
    body('dueDate')
      .optional({ values: 'null' })
      .isString()
      .bail()
      .isISO8601({ strict: true, strictSeparator: true })
      .toDate()
  ],
  validateRequest,
  taskController.create
);

router.get('/:id', [param('id').isMongoId()], validateRequest, taskController.getOne);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title')
      .optional()
      .isString()
      .bail()
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Informe um título de até 100 caracteres.'),
    body('description').optional().isString().bail().isLength({ max: 500 }),
    body('status').optional().isString().bail().isIn(['pending', 'completed']),
    body('priority').optional().isString().bail().isIn(['low', 'medium', 'high']),
    body('dueDate')
      .optional({ values: 'null' })
      .isString()
      .bail()
      .isISO8601({ strict: true, strictSeparator: true })
      .toDate()
  ],
  validateRequest,
  taskController.update
);

router.delete('/:id', [param('id').isMongoId()], validateRequest, taskController.remove);

module.exports = router;
