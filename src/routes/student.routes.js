const { Router } = require('express');
const { makeStudentController } = require('../factories/student.factory');
const { requireAdminAccess } = require('../middlewares/requireAdminAccess');
const { validate } = require('../middlewares/validate');
const {
  createStudentSchema,
  updateStudentSchema,
} = require('../schemas/student.schemas');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeStudentController();

router.use(requireAdminAccess(auth));

/**
 * @openapi
 * tags:
 *   name: Students
 *   description: Gerenciamento de alunos (apenas admin ou developer)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmn6e30tn0002d8ijdvuq5hw7
 *         userId:
 *           type: string
 *           example: FnUl78Z9vAOZh9lpjI9nXqS69jaTlNK6
 *         name:
 *           type: string
 *           example: Ana Souza
 *         email:
 *           type: string
 *           example: ana@aluno.senai.com
 *         turmaId:
 *           type: string
 *           example: cmn6e30tn0000d8ijdvuq5hw5
 *         turma:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: cmn6e30tn0000d8ijdvuq5hw5
 *             name:
 *               type: string
 *               example: Turma A - Desenvolvimento de Sistemas 2024
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     StudentCreated:
 *       allOf:
 *         - $ref: '#/components/schemas/Student'
 *         - type: object
 *           properties:
 *             defaultPassword:
 *               type: string
 *               description: Senha gerada para o primeiro acesso — comunique ao aluno
 *               example: Senai@482931
 *     CreateStudent:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - turmaId
 *       properties:
 *         name:
 *           type: string
 *           example: Ana Souza
 *         email:
 *           type: string
 *           example: ana@aluno.senai.com
 *         turmaId:
 *           type: string
 *           example: cmn6e30tn0000d8ijdvuq5hw5
 *     UpdateStudent:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Ana Souza
 *         email:
 *           type: string
 *           example: ana@aluno.senai.com
 */

/**
 * @openapi
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Cria um novo aluno
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudent'
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentCreated'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     tags: [Students]
 *     summary: Lista todos os alunos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', validate(createStudentSchema), (req, res, next) =>
  controller.create(req, res, next),
);

router.get('/', (req, res, next) => controller.getAll(req, res, next));

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Busca um aluno pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0002d8ijdvuq5hw7
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Students]
 *     summary: Atualiza os dados de um aluno
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0002d8ijdvuq5hw7
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudent'
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Students]
 *     summary: Remove um aluno
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0002d8ijdvuq5hw7
 *     responses:
 *       204:
 *         description: Aluno removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res, next) => controller.getById(req, res, next));

router.put('/:id', validate(updateStudentSchema), (req, res, next) =>
  controller.update(req, res, next),
);

router.delete('/:id', (req, res, next) => controller.remove(req, res, next));

module.exports = router;
