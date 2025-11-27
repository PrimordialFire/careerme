const { getFirestore } = require('../config/firebase');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('courses').get();
    
    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('courses').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Get courses by institution
exports.getCoursesByInstitution = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('courses')
      .where('institutionId', '==', req.params.institutionId)
      .get();
    
    const courses = [];
    snapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const db = getFirestore();
    
    // Check if user has permission
    if (req.userData.role === 'institute' && req.body.institutionId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Can only create courses for your institution' });
    }

    const courseData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const docRef = await db.collection('courses').add(courseData);

    res.status(201).json({
      message: 'Course created successfully',
      id: docRef.id,
      ...courseData
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Get course to check institution
    const courseDoc = await db.collection('courses').doc(id).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseData = courseDoc.data();
    
    // Check if user has permission
    if (req.userData.role === 'institute' && courseData.institutionId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('courses').doc(id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Get course to check institution
    const courseDoc = await db.collection('courses').doc(id).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseData = courseDoc.data();
    
    // Check if user has permission
    if (req.userData.role === 'institute' && courseData.institutionId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('courses').doc(id).delete();

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};
