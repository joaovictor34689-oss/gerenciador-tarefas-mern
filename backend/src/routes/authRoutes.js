const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();

router.post('/register', [
  body('name').isString().trim().isLength({ min: 2, max: 60 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8, max: 72 })
], validateRequest, authController.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').isString().notEmpty()
], validateRequest, authController.login);

router.get('/me', requireAuth, authController.me);

module.exports = router;
