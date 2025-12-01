const { getFirestore } = require('../config/firebase');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const db = getFirestore();

    const [usersSnap, institutionsSnap, coursesSnap, applicationsSnap, jobsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('users').where('role', '==', 'institute').get(),
      db.collection('courses').get(),
      db.collection('applications').get(),
      db.collection('jobs').get()
    ]);

    const users = [];
    usersSnap.forEach(doc => users.push(doc.data()));

    const applications = [];
    applicationsSnap.forEach(doc => applications.push(doc.data()));

    const stats = {
      totalUsers: usersSnap.size,
      students: users.filter(u => u.role === 'student').length,
      institutions: institutionsSnap.size,
      companies: users.filter(u => u.role === 'company').length,
      pendingCompanies: users.filter(u => u.role === 'company' && u.status === 'pending').length,
      totalCourses: coursesSnap.size,
      totalApplications: applicationsSnap.size,
      pendingApplications: applications.filter(a => a.status === 'pending').length,
      admittedApplications: applications.filter(a => a.status === 'admitted').length,
      totalJobs: jobsSnap.size
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Update company status
exports.updateCompanyStatus = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;
    const { status } = req.body;

    // Verify it's a company
    const companyDoc = await db.collection('users').doc(id).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = companyDoc.data();
    if (companyData.role !== 'company') {
      return res.status(400).json({ error: 'User is not a company' });
    }

    await db.collection('users').doc(id).update({
      status,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: req.user.uid
    });

    res.status(200).json({ 
      message: `Company ${status === 'active' ? 'approved' : status}`,
      status 
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ error: 'Failed to update company status' });
  }
};

// Get system reports
exports.getSystemReports = async (req, res) => {
  try {
    const db = getFirestore();

    const [
      usersSnap,
      applicationsSnap,
      jobsSnap,
      jobApplicationsSnap
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('applications').get(),
      db.collection('jobs').get(),
      db.collection('jobApplications').get()
    ]);

    const users = [];
    usersSnap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

    const applications = [];
    applicationsSnap.forEach(doc => applications.push({ id: doc.id, ...doc.data() }));

    const jobApplications = [];
    jobApplicationsSnap.forEach(doc => jobApplications.push({ id: doc.id, ...doc.data() }));

    // Generate reports
    const reports = {
      userRegistrations: {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        institutions: users.filter(u => u.role === 'institute').length,
        companies: users.filter(u => u.role === 'company').length,
        byMonth: {} // Can be expanded with date grouping
      },
      applications: {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        admitted: applications.filter(a => a.status === 'admitted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        waiting: applications.filter(a => a.status === 'waiting').length,
        confirmed: applications.filter(a => a.status === 'confirmed').length
      },
      employment: {
        totalJobs: jobsSnap.size,
        totalApplications: jobApplications.length,
        activeJobs: jobApplications.filter(j => j.status === 'active').length
      },
      topInstitutions: users
        .filter(u => u.role === 'institute')
        .map(inst => ({
          id: inst.id,
          name: inst.institutionName || inst.name,
          applications: applications.filter(a => a.institutionId === inst.id).length
        }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 5)
    };

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
};

// Publish admissions
exports.publishAdmissions = async (req, res) => {
  try {
    const db = getFirestore();
    const { institutionId, courses } = req.body;

    // Verify institution exists
    const instDoc = await db.collection('users').doc(institutionId).get();
    if (!instDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Create admission publication record
    const admissionData = {
      institutionId,
      institutionName: instDoc.data().institutionName || instDoc.data().name,
      courses,
      publishedBy: req.user.uid,
      publishedAt: new Date().toISOString(),
      status: 'published'
    };

    const docRef = await db.collection('admissions').add(admissionData);

    res.status(201).json({
      message: 'Admissions published successfully',
      id: docRef.id,
      ...admissionData
    });
  } catch (error) {
    console.error('Error publishing admissions:', error);
    res.status(500).json({ error: 'Failed to publish admissions' });
  }
};
