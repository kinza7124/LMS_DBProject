const pool = require('../config/db');
const { ensureStudentProfile } = require('./studentModel');

const enrollUser = async ({ userId, courseId, term }) => {
  const student = await ensureStudentProfile(userId);
  const query = `
    INSERT INTO enrollments (student_id, course_id, term)
    VALUES ($1, $2, $3)
    ON CONFLICT (student_id, course_id, term) DO NOTHING
    RETURNING *
  `;
  const { rows } = await pool.query(query, [student.student_id, courseId, term]);
  return rows[0];
};

const getEnrollmentsByUser = async (userId) => {
  const student = await ensureStudentProfile(userId);
  const query = `
    SELECT e.*, c.title, c.description, c.code
    FROM enrollments e
    JOIN courses c ON c.course_id = e.course_id
    WHERE e.student_id = $1
    ORDER BY e.enrollment_date DESC
  `;
  const { rows } = await pool.query(query, [student.student_id]);
  return rows;
};

const removeEnrollment = async ({ userId, courseId, term }) => {
  const student = await ensureStudentProfile(userId);
  await pool.query(
    'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 AND term = $3',
    [student.student_id, courseId, term],
  );
};

const updateGrade = async ({ userId, courseId, term, grade }) => {
  const student = await ensureStudentProfile(userId);
  const query = `
    UPDATE enrollments
    SET grade = $4
    WHERE student_id = $1 AND course_id = $2 AND term = $3
    RETURNING *
  `;
  const { rows } = await pool.query(query, [student.student_id, courseId, term, grade]);
  return rows[0];
};

const getEnrollmentsByCourse = async (courseId) => {
  const query = `
    SELECT e.*, 
           s.student_id, u.full_name as student_name, u.email as student_email,
           s.major, s.enrollment_year
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    WHERE e.course_id = $1
    ORDER BY e.enrollment_date DESC
  `;
  const { rows } = await pool.query(query, [courseId]);
  return rows;
};

const getAllEnrollments = async () => {
  const query = `
    SELECT e.*, 
           s.student_id, u.full_name as student_name, u.email as student_email,
           s.major, s.enrollment_year,
           c.code, c.title as course_title
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON e.course_id = c.course_id
    ORDER BY e.enrollment_date DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const calculateGPA = async (userId) => {
  const student = await ensureStudentProfile(userId);
  const query = `
    SELECT e.grade, c.credits
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE e.student_id = $1 AND e.grade IS NOT NULL AND e.grade != 'W'
  `;
  const { rows } = await pool.query(query, [student.student_id]);

  const gradePoints = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
  let totalPoints = 0;
  let totalCredits = 0;

  rows.forEach((row) => {
    const points = gradePoints[row.grade] || 0;
    const credits = row.credits || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return { gpa: parseFloat(gpa.toFixed(2)), totalCredits, coursesCount: rows.length };
};

module.exports = {
  enrollUser,
  getEnrollmentsByUser,
  removeEnrollment,
  updateGrade,
  getEnrollmentsByCourse,
  getAllEnrollments,
  calculateGPA,
};

