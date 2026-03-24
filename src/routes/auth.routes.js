const { Router } = require('express');
const { makeAuthController } = require('../factories/auth.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { validate } = require('../middlewares/validate');
const {
  loginSchema,
  changePasswordSchema,
} = require('../schemas/auth.schemas');
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
router.post('/login', validate(loginSchema), (req, res, next) =>
  controller.login(req, res, next),
);

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

/**
 * @openapi
 * components:
 *   schemas:
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: Senai@482931
 *         newPassword:
 *           type: string
 *           example: minhasenha123
 */

/**
 * @openapi
 * /change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Troca a senha do usuário autenticado
 *     description: |
 *       Obrigatório no primeiro acesso do professor (`mustChangePassword: true`).
 *       Requer autenticação via `Authorization: Bearer <token>`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully.
 *       401:
 *         description: Não autenticado ou senha atual incorreta
 */
router.post(
  '/change-password',
  requireAuth(auth),
  validate(changePasswordSchema),
  (req, res, next) => controller.changePassword(req, res, next),
);

module.exports = router;
