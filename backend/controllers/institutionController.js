const { getFirestore } = require('../config/firebase');

// Get all institutions
exports.getAllInstitutions = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('users')
      .where('role', '==', 'institute')
      .get();
    
    const institutions = [];
    snapshot.forEach(doc => {
      institutions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
};

// Get institution by ID
exports.getInstitutionById = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const data = doc.data();
    if (data.role !== 'institute') {
      return res.status(404).json({ error: 'Not an institution' });
    }

    res.status(200).json({ id: doc.id, ...data });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Failed to fetch institution' });
  }
};

// Create new institution
exports.createInstitution = async (req, res) => {
  try {
    const db = getFirestore();
    const institutionData = {
      ...req.body,
      role: 'institute',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const docRef = await db.collection('users').add(institutionData);

    res.status(201).json({
      message: 'Institution created successfully',
      id: docRef.id,
      ...institutionData
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Failed to create institution' });
  }
};

// Update institution
exports.updateInstitution = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check if user has permission
    if (req.userData.role === 'institute' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('users').doc(id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Institution updated successfully' });
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({ error: 'Failed to update institution' });
  }
};

// Delete institution
exports.deleteInstitution = async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('users').doc(req.params.id).delete();

    res.status(200).json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ error: 'Failed to delete institution' });
  }
};

// Get faculties for institution
exports.getFaculties = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('faculties')
      .where('institutionId', '==', req.params.id)
      .get();
    
    const faculties = [];
    snapshot.forEach(doc => {
      faculties.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(faculties);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
};

// Add faculty
exports.addFaculty = async (req, res) => {
  try {
    const db = getFirestore();
    const facultyData = {
      ...req.body,
      instituteId: req.params.id, // Use 'instituteId' for Firestore rules compatibility
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('faculties').add(facultyData);

    res.status(201).json({
      message: 'Faculty created successfully',
      id: docRef.id,
      ...facultyData
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ error: 'Failed to create faculty' });
  }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
  try {
    const db = getFirestore();
    const { facultyId } = req.params;

    await db.collection('faculties').doc(facultyId).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const db = getFirestore();
    await db.collection('faculties').doc(req.params.facultyId).delete();

    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
};
