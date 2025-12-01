const { getFirestore } = require('../config/firebase');

// Job matching algorithm
const matchJobToStudent = (studentProfile, job) => {
  let score = 0;
  const reasons = [];

  const requirements = job.requirements || {};

  // GPA matching (40%)
  if (requirements.minimumGPA && studentProfile.gpa) {
    if (studentProfile.gpa >= requirements.minimumGPA) {
      score += 40;
      reasons.push('Meets GPA requirements');
    }
  } else {
    score += 20; // Partial credit if no GPA requirement
  }

  // Field of study matching (30%)
  if (requirements.fieldOfStudy && studentProfile.fieldOfStudy) {
    const fieldsMatch = requirements.fieldOfStudy.some(field => 
      studentProfile.fieldOfStudy.toLowerCase().includes(field.toLowerCase())
    );
    if (fieldsMatch) {
      score += 30;
      reasons.push('Relevant field of study');
    }
  } else {
    score += 15; // Partial credit if no field requirement
  }

  // Skills matching (20%)
  if (requirements.skills && studentProfile.skills && studentProfile.skills.length > 0) {
    const matchingSkills = requirements.skills.filter(skill => 
      studentProfile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    if (matchingSkills.length > 0) {
      const skillScore = (matchingSkills.length / requirements.skills.length) * 20;
      score += skillScore;
      reasons.push(`Matching skills: ${matchingSkills.join(', ')}`);
    }
  } else {
    score += 10; // Partial credit if no skills requirement
  }

  // Experience matching (10%)
  if (requirements.experience && studentProfile.experience) {
    if (studentProfile.experience >= requirements.experience) {
      score += 10;
      reasons.push('Meets experience requirements');
    }
  } else {
    score += 5; // Partial credit if no experience requirement
  }

  return {
    matchScore: Math.round(score),
    matchReasons: reasons,
    isQualified: score >= 60 // 60% match required
  };
};

// Get jobs (filtered for students)
exports.getJobs = async (req, res) => {
  try {
    const db = getFirestore();
    let query = db.collection('jobs');

    // If company, show only their jobs
    if (req.userData.role === 'company') {
      query = query.where('companyId', '==', req.user.uid);
    }

    const snapshot = await query.get();
    let jobs = [];
    snapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    // If student, filter by qualifications
    if (req.userData.role === 'student') {
      const studentProfile = {
        gpa: req.userData.gpa || 0,
        fieldOfStudy: req.userData.fieldOfStudy || req.userData.education || '',
        skills: req.userData.skills || [],
        experience: req.userData.experience || 0
      };

      jobs = jobs.map(job => {
        const match = matchJobToStudent(studentProfile, job);
        return {
          ...job,
          ...match
        };
      }).filter(job => job.isQualified);
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('jobs').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create new job
exports.createJob = async (req, res) => {
  try {
    const db = getFirestore();
    
    const jobData = {
      ...req.body,
      companyId: req.user.uid,
      companyName: req.userData.companyName || req.userData.name,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const docRef = await db.collection('jobs').add(jobData);

    res.status(201).json({
      message: 'Job posted successfully',
      id: docRef.id,
      ...jobData
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check if job belongs to company
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobData = jobDoc.data();
    if (jobData.companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('jobs').doc(id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check if job belongs to company
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobData = jobDoc.data();
    if (jobData.companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.collection('jobs').doc(id).delete();

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Get qualified candidates
exports.getQualifiedCandidates = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Get job
    const jobDoc = await db.collection('jobs').doc(id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    if (job.companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all students with transcripts
    const [usersSnap, documentsSnap, applicationsSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'student').get(),
      db.collection('documents').get(),
      db.collection('applications').where('status', '==', 'admitted').get()
    ]);

    const students = [];
    usersSnap.forEach(doc => {
      students.push({ id: doc.id, ...doc.data() });
    });

    const documents = {};
    documentsSnap.forEach(doc => {
      const data = doc.data();
      if (!documents[data.studentId]) {
        documents[data.studentId] = [];
      }
      documents[data.studentId].push(data);
    });

    const admissions = {};
    applicationsSnap.forEach(doc => {
      const data = doc.data();
      if (!admissions[data.studentId]) {
        admissions[data.studentId] = [];
      }
      admissions[data.studentId].push(data);
    });

    // Filter and score candidates
    const qualifiedCandidates = students.map(student => {
      const studentDocs = documents[student.id] || [];
      const studentAdmissions = admissions[student.id] || [];

      const hasTranscripts = studentDocs.some(doc => doc.type === 'Transcript');
      const hasCertificates = studentDocs.some(doc => doc.type === 'Certificate');

      // Calculate qualification score
      const match = matchJobToStudent({
        gpa: student.gpa || 0,
        fieldOfStudy: student.fieldOfStudy || student.education || '',
        skills: student.skills || [],
        experience: student.experience || 0
      }, { requirements: job.requirements });

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        gpa: student.gpa,
        fieldOfStudy: student.fieldOfStudy,
        skills: student.skills,
        experience: student.experience,
        hasTranscripts,
        hasCertificates,
        admissions: studentAdmissions.length,
        qualificationScore: match.matchScore,
        matchReasons: match.matchReasons
      };
    }).filter(candidate => candidate.qualificationScore >= 60 && candidate.hasTranscripts)
      .sort((a, b) => b.qualificationScore - a.qualificationScore);

    res.status(200).json(qualifiedCandidates);
  } catch (error) {
    console.error('Error fetching qualified candidates:', error);
    res.status(500).json({ error: 'Failed to fetch qualified candidates' });
  }
};

// Apply for job
exports.applyForJob = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    // Check if student has transcripts
    const documentsSnap = await db.collection('documents')
      .where('studentId', '==', req.user.uid)
      .where('type', '==', 'Transcript')
      .get();

    if (documentsSnap.empty) {
      return res.status(400).json({ 
        error: 'Missing documents',
        message: 'Please upload your transcripts before applying for jobs' 
      });
    }

    // Check if already applied
    const existingApp = await db.collection('jobApplications')
      .where('studentId', '==', req.user.uid)
      .where('jobId', '==', id)
      .get();

    if (!existingApp.empty) {
      return res.status(400).json({ 
        error: 'Already applied',
        message: 'You have already applied for this job' 
      });
    }

    // Create application
    const applicationData = {
      jobId: id,
      studentId: req.user.uid,
      studentName: req.userData.name,
      studentEmail: req.userData.email || req.user.email,
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('jobApplications').add(applicationData);

    res.status(201).json({
      message: 'Application submitted successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
};
