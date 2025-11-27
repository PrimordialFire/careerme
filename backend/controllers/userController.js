const { getFirestore } = require('../config/firebase');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const db = getFirestore();
    const { role } = req.query;

    let query = db.collection('users');
    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check permission
    if (req.userData.role !== 'admin' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const doc = await db.collection('users').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check permission
    if (req.userData.role !== 'admin' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('users').doc(id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const db = getFirestore();
    
    const documentData = {
      ...req.body,
      studentId: req.user.uid,
      uploadedAt: new Date().toISOString()
    };

    const docRef = await db.collection('documents').add(documentData);

    res.status(201).json({
      message: 'Document uploaded successfully',
      id: docRef.id,
      ...documentData
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get user documents
exports.getUserDocuments = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check permission
    if (req.userData.role !== 'admin' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const snapshot = await db.collection('documents')
      .where('studentId', '==', id)
      .get();
    
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};
