const { Router } = require('express');
const { body } = require('express-validator');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' }
});

router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .isString()
      .bail()
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage('Informe um nome entre 2 e 60 caracteres.'),
    body('email')
      .isString()
      .bail()
      .trim()
      .isLength({ max: 254 })
      .isEmail()
      .withMessage('Informe um e-mail válido.'),
    body('password')
      .isString()
      .bail()
      .isLength({ min: 8 })
      .withMessage('Use pelo menos 8 caracteres.')
      .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
      .withMessage('A senha deve ter no máximo 72 bytes.')
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isString()
      .bail()
      .trim()
      .isLength({ max: 254 })
      .isEmail()
      .withMessage('Informe um e-mail válido.'),
    body('password')
      .isString()
      .bail()
      .notEmpty()
      .isLength({ max: 72 })
      .withMessage('Informe sua senha.')
  ],
  validateRequest,
  authController.login
);

router.get('/me', requireAuth, authController.me);

module.exports = router;
