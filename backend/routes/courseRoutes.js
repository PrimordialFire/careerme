const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const courseController = require('../controllers/courseController');

// Get all courses
router.get('/', courseController.getAllCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// Get courses by institution
router.get('/institution/:institutionId', courseController.getCoursesByInstitution);

// Create new course (Admin or Institute)
router.post('/',
  authenticate,
  checkRole('admin', 'institute'),
  [
    body('name').notEmpty().trim(),
    body('code').notEmpty().trim(),
    body('institutionId').notEmpty(),
    body('facultyId').notEmpty(),
    body('level').isIn(['Undergraduate', 'Masters', 'PhD']),
    validate
  ],
  courseController.createCourse
);

// Update course
router.put('/:id',
  authenticate,
  checkRole('admin', 'institute'),
  courseController.updateCourse
);

// Delete course
router.delete('/:id',
  authenticate,
  checkRole('admin', 'institute'),
  courseController.deleteCourse
);

module.exports = router;
