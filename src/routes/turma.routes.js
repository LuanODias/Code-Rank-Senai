const { Router } = require('express');
const { makeTurmaController } = require('../factories/turma.factory');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireRole } = require('../middlewares/requireRole');
const { requireAdminAccess } = require('../middlewares/requireAdminAccess');
const { validate } = require('../middlewares/validate');
const {
  createTurmaSchema,
  updateTurmaSchema,
} = require('../schemas/turma.schemas');
const { getAuth } = require('../config/auth');

const router = Router();
const auth = getAuth();
const controller = makeTurmaController();

const teacherAccess = [
  requireAuth(auth),
  requireRole(['teacher', 'admin', 'developer']),
];

/**
 * @openapi
 * tags:
 *   name: Turmas
 *   description: Gerenciamento de turmas (professor, admin ou developer)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Turma:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmn6e30tn0000d8ijdvuq5hw5
 *         name:
 *           type: string
 *           example: Turma A - Desenvolvimento de Sistemas 2024
 *         teacherId:
 *           type: string
 *           example: cmn6e30tn0001d8ijdvuq5hw6
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TurmaWithStudents:
 *       allOf:
 *         - $ref: '#/components/schemas/Turma'
 *         - type: object
 *           properties:
 *             students:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: cmn6e30tn0002d8ijdvuq5hw7
 *                   name:
 *                     type: string
 *                     example: Ana Souza
 *                   email:
 *                     type: string
 *                     example: ana@aluno.senai.com
 *     CreateTurma:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Turma A - Desenvolvimento de Sistemas 2024
 *     UpdateTurma:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Turma B - Desenvolvimento de Sistemas 2024
 */

/**
 * @openapi
 * /turmas:
 *   post:
 *     tags: [Turmas]
 *     summary: Cria uma nova turma (apenas admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTurma'
 *     responses:
 *       201:
 *         description: Turma criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turma'
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
 *   get:
 *     tags: [Turmas]
 *     summary: Lista todas as turmas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turmas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turma'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requireAdminAccess(auth),
  validate(createTurmaSchema),
  (req, res, next) => controller.create(req, res, next),
);

router.get('/', ...teacherAccess, (req, res, next) =>
  controller.getAll(req, res, next),
);

/**
 * @openapi
 * /turmas/{id}:
 *   get:
 *     tags: [Turmas]
 *     summary: Busca uma turma pelo ID (inclui alunos matriculados)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0000d8ijdvuq5hw5
 *     responses:
 *       200:
 *         description: Turma encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TurmaWithStudents'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Turma não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Turmas]
 *     summary: Atualiza uma turma (professor só pode atualizar a própria)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0000d8ijdvuq5hw5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTurma'
 *     responses:
 *       200:
 *         description: Turma atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turma'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Turma não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Turmas]
 *     summary: Remove uma turma (professor só pode remover a própria)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0000d8ijdvuq5hw5
 *     responses:
 *       204:
 *         description: Turma removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Turma não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', ...teacherAccess, (req, res, next) =>
  controller.getById(req, res, next),
);

router.put(
  '/:id',
  ...teacherAccess,
  validate(updateTurmaSchema),
  (req, res, next) => controller.update(req, res, next),
);

router.delete('/:id', ...teacherAccess, (req, res, next) =>
  controller.remove(req, res, next),
);

/**
 * @openapi
 * /turmas/{id}/students/{studentId}:
 *   post:
 *     tags: [Turmas]
 *     summary: Matricula um aluno na turma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0000d8ijdvuq5hw5
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0002d8ijdvuq5hw7
 *     responses:
 *       200:
 *         description: Aluno matriculado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Turma ou aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Turmas]
 *     summary: Remove um aluno da turma
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0000d8ijdvuq5hw5
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmn6e30tn0002d8ijdvuq5hw7
 *     responses:
 *       204:
 *         description: Aluno removido da turma com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Turma ou aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/students/:studentId', ...teacherAccess, (req, res, next) =>
  controller.addStudent(req, res, next),
);

router.delete('/:id/students/:studentId', ...teacherAccess, (req, res, next) =>
  controller.removeStudent(req, res, next),
);

module.exports = router;
