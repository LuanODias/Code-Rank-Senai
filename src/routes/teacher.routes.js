const { Router } = require('express');
const { makeTeacherController } = require('../factories/teacher.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireRole } = require('../middlewares/requireRole');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeTeacherController();

router.use(requireAuth(auth));
router.use(requireRole(['admin', 'developer']));

/**
 * @openapi
 * tags:
 *   name: Teachers
 *   description: Gerenciamento de professores (apenas admin/developer)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clx1abc123
 *         userId:
 *           type: string
 *           example: clx1xyz456
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@senai.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTeacher:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@senai.com
 *         password:
 *           type: string
 *           example: senha123
 *     UpdateTeacher:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@senai.com
 */

/**
 * @openapi
 * /teachers:
 *   post:
 *     tags: [Teachers]
 *     summary: Cadastra um novo professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeacher'
 *     responses:
 *       201:
 *         description: Professor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', (req, res, next) => controller.create(req, res, next));

/**
 * @openapi
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: Lista todos os professores
 *     responses:
 *       200:
 *         description: Lista de professores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @openapi
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Busca um professor pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     responses:
 *       200:
 *         description: Professor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Professor não encontrado
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
 * /teachers/{id}:
 *   put:
 *     tags: [Teachers]
 *     summary: Atualiza os dados de um professor
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
 *             $ref: '#/components/schemas/UpdateTeacher'
 *     responses:
 *       200:
 *         description: Professor atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Professor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.put('/:id', (req, res, next) => controller.update(req, res, next));

/**
 * @openapi
 * /teachers/{id}:
 *   delete:
 *     tags: [Teachers]
 *     summary: Remove um professor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clx1abc123
 *     responses:
 *       204:
 *         description: Professor removido com sucesso
 *       404:
 *         description: Professor não encontrado
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
