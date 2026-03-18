const { Router } = require('express');
const { makeAuthController } = require('../factories/auth.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeAuthController();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Autenticação de usuários (professores e admins)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: maria@senai.com
 *         password:
 *           type: string
 *           example: senha123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: clx1abc123
 *             name:
 *               type: string
 *               example: Maria Admin
 *             email:
 *               type: string
 *               example: maria@senai.com
 *             role:
 *               type: string
 *               enum: [teacher, admin, developer]
 *               example: admin
 *         token:
 *           type: string
 *           description: Token de sessão — use como Authorization Bearer nas rotas protegidas
 *           example: eyJhbGci...
 */

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Realiza login (professor ou admin)
 *     description: |
 *       Retorna o token de sessão. Use-o como `Authorization: Bearer <token>` nas rotas protegidas.
 *       - **Professores** têm acesso apenas às rotas de seu perfil.
 *       - **Admins/Developers** têm acesso às rotas de gerenciamento de professores.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

/**
 * @openapi
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerra a sessão do usuário autenticado
 *     responses:
 *       204:
 *         description: Sessão encerrada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/logout', requireAuth(auth), (req, res, next) =>
  controller.logout(req, res, next),
);

module.exports = router;
