const { getFirestore } = require('../config/firebase');

// Get applications (filtered by role)
exports.getApplications = async (req, res) => {
  try {
    const db = getFirestore();
    let query = db.collection('applications');

    // Filter based on user role
    if (req.userData.role === 'student') {
      query = query.where('studentId', '==', req.user.uid);
    } else if (req.userData.role === 'institute') {
      query = query.where('institutionId', '==', req.user.uid);
    }

    const snapshot = await query.get();
    const applications = [];
    snapshot.forEach(doc => {
      applications.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('applications').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const data = doc.data();

    // Check permission
    if (req.userData.role === 'student' && data.studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.userData.role === 'institute' && data.institutionId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.status(200).json({ id: doc.id, ...data });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// Submit new application
exports.submitApplication = async (req, res) => {
  try {
    const db = getFirestore();
    const { institutionId, courseId, course, level, previousEducation } = req.body;

    // Check if student already has 2 applications at this institution
    const existingApps = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .where('institutionId', '==', institutionId)
      .where('status', 'in', ['pending', 'admitted', 'waiting'])
      .get();

    if (existingApps.size >= 2) {
      return res.status(400).json({ 
        error: 'Maximum applications reached',
        message: 'You can only apply to 2 courses per institution' 
      });
    }

    // Check for duplicate application
    const duplicateApp = existingApps.docs.find(doc => doc.data().courseId === courseId);
    if (duplicateApp) {
      return res.status(400).json({ 
        error: 'Duplicate application',
        message: 'You have already applied to this course' 
      });
    }

    // Validate education level requirements
    const requiredEducation = {
      'Undergraduate': ['High School', 'Secondary', 'O-Level', 'A-Level'],
      'Masters': ['Bachelor', 'Undergraduate', 'Degree'],
      'PhD': ['Masters', 'Graduate']
    };

    const previousEd = previousEducation.toLowerCase();
    const qualifies = requiredEducation[level].some(req => 
      previousEd.includes(req.toLowerCase())
    );

    if (!qualifies) {
      return res.status(400).json({ 
        error: 'Not qualified',
        message: `You don't meet the education requirements for ${level} level` 
      });
    }

    // Create application
    const applicationData = {
      ...req.body,
      studentId: req.user.uid,
      studentName: req.userData.name,
      studentEmail: req.userData.email || req.user.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(applicationData);

    res.status(201).json({
      message: 'Application submitted successfully',
      id: docRef.id,
      ...applicationData
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;
    const { status } = req.body;

    // Get application
    const appDoc = await db.collection('applications').doc(id).get();
    if (!appDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const appData = appDoc.data();

    // Check permission for institute
    if (req.userData.role === 'institute' && appData.institutionId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // If admitting, check for duplicate admissions at same institution
    if (status === 'admitted') {
      const existingAdmissions = await db.collection('applications')
        .where('studentId', '==', appData.studentId)
        .where('institutionId', '==', appData.institutionId)
        .where('status', '==', 'admitted')
        .get();

      if (existingAdmissions.size > 0) {
        const existingCourse = existingAdmissions.docs[0].data().course;
        return res.status(400).json({ 
          error: 'Duplicate admission',
          message: `Student is already admitted to ${existingCourse}` 
        });
      }
    }

    // Update status
    await db.collection('applications').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ 
      message: 'Application status updated successfully',
      status 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Select institution (for multiple admissions)
exports.selectInstitution = async (req, res) => {
  try {
    const db = getFirestore();
    const { selectedApplicationId } = req.body;

    // Get all admitted applications for student
    const admittedApps = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .where('status', '==', 'admitted')
      .get();

    if (admittedApps.empty) {
      return res.status(400).json({ error: 'No admitted applications found' });
    }

    // Confirm selected application
    await db.collection('applications').doc(selectedApplicationId).update({
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    });

    // Decline other admissions and promote from waiting list
    const batch = db.batch();
    
    for (const doc of admittedApps.docs) {
      if (doc.id !== selectedApplicationId) {
        // Decline this admission
        batch.update(doc.ref, {
          status: 'declined',
          declinedAt: new Date().toISOString()
        });

        const declinedData = doc.data();
        
        // Promote from waiting list
        const waitingList = await db.collection('applications')
          .where('institutionId', '==', declinedData.institutionId)
          .where('courseId', '==', declinedData.courseId)
          .where('status', '==', 'waiting')
          .orderBy('createdAt', 'asc')
          .limit(1)
          .get();

        if (!waitingList.empty) {
          const firstWaiting = waitingList.docs[0];
          batch.update(firstWaiting.ref, {
            status: 'admitted',
            promotedAt: new Date().toISOString()
          });
        }
      }
    }

    await batch.commit();

    res.status(200).json({ 
      message: 'Institution selected successfully',
      selectedApplicationId 
    });
  } catch (error) {
    console.error('Error selecting institution:', error);
    res.status(500).json({ error: 'Failed to select institution' });
  }
};
