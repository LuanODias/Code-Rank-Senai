const { Router } = require('express');
const { makeChallengeController } = require('../factories/challenge.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireRole } = require('../middlewares/requireRole');
const { validate } = require('../middlewares/validate');
const {
  createChallengeSchema,
  updateChallengeSchema,
} = require('../schemas/challenge.schemas');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeChallengeController();

router.use(requireAuth(auth));
router.use(requireRole(['teacher', 'admin', 'developer']));

/**
 * @openapi
 * tags:
 *   name: Challenges
 *   description: Gerenciamento de desafios (professor, admin ou developer)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx1abc123
 *         title:
 *           type: string
 *           example: Soma de Dois Números
 *         description:
 *           type: string
 *           example: Dado dois inteiros, retorne a soma deles.
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: easy
 *         teacher:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: clx1xyz456
 *             name:
 *               type: string
 *               example: João Silva
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateChallenge:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           example: Soma de Dois Números
 *         description:
 *           type: string
 *           example: Dado dois inteiros, retorne a soma deles.
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: medium
 *     UpdateChallenge:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Soma de Dois Números
 *         description:
 *           type: string
 *           example: Dado dois inteiros, retorne a soma deles.
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: hard
 */

/**
 * @openapi
 * /challenges:
 *   post:
 *     tags: [Challenges]
 *     summary: Cria um novo desafio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallenge'
 *     responses:
 *       201:
 *         description: Desafio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Dificuldade inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', validate(createChallengeSchema), (req, res, next) =>
  controller.create(req, res, next),
);

/**
 * @openapi
 * /challenges:
 *   get:
 *     tags: [Challenges]
 *     summary: Lista todos os desafios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de desafios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @openapi
 * /challenges/{id}:
 *   get:
 *     tags: [Challenges]
 *     summary: Busca um desafio pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     responses:
 *       200:
 *         description: Desafio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Desafio não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

/**
 * @openapi
 * /challenges/{id}:
 *   put:
 *     tags: [Challenges]
 *     summary: Atualiza um desafio (professor só pode atualizar o próprio)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateChallenge'
 *     responses:
 *       200:
 *         description: Desafio atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Dificuldade inválida
 *       404:
 *         description: Desafio não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.put('/:id', validate(updateChallengeSchema), (req, res, next) =>
  controller.update(req, res, next),
);

/**
 * @openapi
 * /challenges/{id}:
 *   delete:
 *     tags: [Challenges]
 *     summary: Remove um desafio (professor só pode remover o próprio)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     responses:
 *       204:
 *         description: Desafio removido com sucesso
 *       404:
 *         description: Desafio não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.delete('/:id', (req, res, next) => controller.remove(req, res, next));

module.exports = router;
