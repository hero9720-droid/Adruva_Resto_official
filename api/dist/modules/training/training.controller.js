"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModule = createModule;
exports.getModules = getModules;
exports.getModuleExam = getModuleExam;
exports.submitExam = submitExam;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function createModule(req, res) {
    const chain_id = req.user.chain_id;
    const { title, description, content_url, type, min_passing_score, estimated_minutes, questions } = req.body;
    const result = await db_1.db.query('BEGIN; ' +
        `INSERT INTO training_modules (chain_id, title, description, content_url, type, min_passing_score, estimated_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id; ` +
        `INSERT INTO training_exams (module_id, questions) VALUES (LASTVAL(), $8); ` +
        'COMMIT;', [chain_id, title, description, content_url, type, min_passing_score || 70, estimated_minutes || 15, JSON.stringify(questions)]);
    res.status(201).json({ success: true, message: 'Module and Exam created' });
}
async function getModules(req, res) {
    const chain_id = req.user.chain_id;
    const staff_id = req.user.staff_id;
    const modules = await db_1.db.query(`SELECT tm.*, 
       (SELECT score FROM staff_certifications WHERE staff_id = $1 AND module_id = tm.id) as staff_score,
       (SELECT passed_at FROM staff_certifications WHERE staff_id = $1 AND module_id = tm.id) as passed_at
     FROM training_modules tm 
     WHERE tm.chain_id = $2 
     ORDER BY tm.created_at DESC`, [staff_id, chain_id]);
    res.json({ success: true, data: modules.rows });
}
async function getModuleExam(req, res) {
    const { id } = req.params;
    const exam = await db_1.db.query('SELECT * FROM training_exams WHERE module_id = $1', [id]);
    if (exam.rowCount === 0)
        throw new errors_1.AppError(404, 'Exam not found', 'NOT_FOUND');
    // Strip correct answers for the frontend
    const safeQuestions = exam.rows[0].questions.map((q) => ({
        question: q.question,
        options: q.options
    }));
    res.json({ success: true, data: { module_id: id, questions: safeQuestions } });
}
async function submitExam(req, res) {
    const { id } = req.params;
    const staff_id = req.user.staff_id;
    const { answers } = req.body; // Array of selected indices
    const examRes = await db_1.db.query('SELECT questions FROM training_exams WHERE module_id = $1', [id]);
    const moduleRes = await db_1.db.query('SELECT min_passing_score FROM training_modules WHERE id = $1', [id]);
    if (examRes.rowCount === 0)
        throw new errors_1.AppError(404, 'Exam not found', 'NOT_FOUND');
    const questions = examRes.rows[0].questions;
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (q.correct_index === answers[idx])
            correctCount++;
    });
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= moduleRes.rows[0].min_passing_score;
    if (passed) {
        await db_1.db.query(`INSERT INTO staff_certifications (staff_id, module_id, score, passed_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (staff_id, module_id) DO UPDATE SET score = EXCLUDED.score, passed_at = NOW()`, [staff_id, id, score]);
    }
    res.json({
        success: true,
        data: {
            score,
            passed,
            correctCount,
            totalCount: questions.length
        }
    });
}
