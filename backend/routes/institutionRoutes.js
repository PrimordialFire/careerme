const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const institutionController = require('../controllers/institutionController');

// Get all institutions
router.get('/', institutionController.getAllInstitutions);

// Get institution by ID
router.get('/:id', institutionController.getInstitutionById);

// Create new institution (Admin only)
router.post('/',
  authenticate,
  checkRole('admin'),
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('type').notEmpty(),
    validate
  ],
  institutionController.createInstitution
);

// Update institution (Admin or Institute)
router.put('/:id',
  authenticate,
  checkRole('admin', 'institute'),
  institutionController.updateInstitution
);

// Delete institution (Admin only)
router.delete('/:id',
  authenticate,
  checkRole('admin'),
  institutionController.deleteInstitution
);

// Get faculties for an institution
router.get('/:id/faculties', institutionController.getFaculties);

// Add faculty to institution (Admin or Institute)
router.post('/:id/faculties',
  authenticate,
  checkRole('admin', 'institute'),
  [
    body('name').notEmpty().trim(),
    validate
  ],
  institutionController.addFaculty
);

// Update faculty
router.put('/:institutionId/faculties/:facultyId',
  authenticate,
  checkRole('admin', 'institute'),
  institutionController.updateFaculty
);

// Delete faculty
router.delete('/:institutionId/faculties/:facultyId',
  authenticate,
  checkRole('admin', 'institute'),
  institutionController.deleteFaculty
);

module.exports = router;
