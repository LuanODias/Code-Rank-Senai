const { Router } = require('express');
const { makeAdminController } = require('../factories/admin.factory');
const { validate } = require('../middlewares/validate');
const { createAdminSchema } = require('../schemas/admin.schemas');
const { env } = require('../config/env');

const router = Router();
const controller = makeAdminController();

const requireAdminSecret = (req, res, next) => {
  if (req.headers['x-admin-secret'] !== env.ADMIN_SECRET) {
    res.status(401).json({ error: 'Invalid admin secret' });
    return;
  }
  next();
};

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Gerenciamento de contas admin e tokens de API (requer X-Admin-Secret)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateAdmin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: Maria Admin
 *         email:
 *           type: string
 *           example: maria@senai.com
 *         password:
 *           type: string
 *           example: senha123
 *     AdminResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx1abc123
 *         name:
 *           type: string
 *           example: Maria Admin
 *         email:
 *           type: string
 *           example: maria@senai.com
 *         role:
 *           type: string
 *           example: admin
 *         token:
 *           type: string
 *           description: JWT válido por 365 dias — use como Authorization Bearer para criar professores
 *           example: eyJhbGci...
 */

/**
 * @openapi
 * /admin:
 *   post:
 *     tags: [Admin]
 *     summary: Cria uma conta de admin
 *     security:
 *       - adminSecret: []
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdmin'
 *     responses:
 *       201:
 *         description: Admin criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminResponse'
 *       401:
 *         description: Admin secret inválido
 *       409:
 *         description: Email já cadastrado
 */
router.post(
  '/',
  requireAdminSecret,
  validate(createAdminSchema),
  (req, res, next) => controller.create(req, res, next),
);

/**
 * @openapi
 * /admin/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Remove uma conta de admin
 *     security:
 *       - adminSecret: []
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     responses:
 *       204:
 *         description: Admin removido com sucesso
 *       401:
 *         description: Admin secret inválido
 *       404:
 *         description: Admin não encontrado
 */
router.delete('/:userId', requireAdminSecret, (req, res, next) =>
  controller.remove(req, res, next),
);
module.exports = router;
