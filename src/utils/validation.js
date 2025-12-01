// Utility functions for validation and business logic

// Validation rules for course applications
export const validateCourseApplication = (studentData, courseData) => {
  const errors = [];

  // Check if student meets course requirements
  if (courseData.minimumGrade && studentData.grades) {
    const studentGrade = parseFloat(studentData.grades);
    const minimumGrade = parseFloat(courseData.minimumGrade);
    
    if (studentGrade < minimumGrade) {
      errors.push(`Minimum grade requirement not met. Required: ${minimumGrade}, Your grade: ${studentGrade}`);
    }
  }

  // Check subject requirements
  if (courseData.requiredSubjects && studentData.subjects) {
    const missingSubjects = courseData.requiredSubjects.filter(
      subject => !studentData.subjects.includes(subject)
    );
    
    if (missingSubjects.length > 0) {
      errors.push(`Missing required subjects: ${missingSubjects.join(', ')}`);
    }
  }

  // Check age requirements (if any)
  if (courseData.minimumAge && studentData.dateOfBirth) {
    const age = calculateAge(studentData.dateOfBirth);
    if (age < courseData.minimumAge) {
      errors.push(`Minimum age requirement not met. Required: ${courseData.minimumAge}, Your age: ${age}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Job matching algorithm
export const matchJobsToStudent = (studentProfile, jobPostings) => {
  return jobPostings.map(job => {
    let score = 0;
    const reasons = [];

    // Academic performance matching
    if (job.requirements.minimumGPA && studentProfile.gpa) {
      if (studentProfile.gpa >= job.requirements.minimumGPA) {
        score += 30;
        reasons.push('Meets GPA requirements');
      }
    }

    // Field of study matching
    if (job.requirements.fieldOfStudy && studentProfile.fieldOfStudy) {
      if (job.requirements.fieldOfStudy.includes(studentProfile.fieldOfStudy)) {
        score += 40;
        reasons.push('Relevant field of study');
      }
    }

    // Skills matching
    if (job.requirements.skills && studentProfile.skills) {
      const matchingSkills = job.requirements.skills.filter(
        skill => studentProfile.skills.includes(skill)
      );
      if (matchingSkills.length > 0) {
        score += (matchingSkills.length / job.requirements.skills.length) * 20;
        reasons.push(`Matching skills: ${matchingSkills.join(', ')}`);
      }
    }

    // Experience matching
    if (job.requirements.experience && studentProfile.experience) {
      if (studentProfile.experience >= job.requirements.experience) {
        score += 10;
        reasons.push('Meets experience requirements');
      }
    }

    return {
      ...job,
      matchScore: Math.round(score),
      matchReasons: reasons,
      isQualified: score >= 60 // 60% match required
    };
  }).filter(job => job.isQualified)
    .sort((a, b) => b.matchScore - a.matchScore);
};

// Automatic qualification filtering for companies
export const filterQualifiedApplicants = (jobRequirements, applicants) => {
  return applicants.filter(applicant => {
    // Check GPA requirement
    if (jobRequirements.minimumGPA && applicant.gpa < jobRequirements.minimumGPA) {
      return false;
    }

    // Check field of study
    if (jobRequirements.fieldOfStudy && 
        !jobRequirements.fieldOfStudy.includes(applicant.fieldOfStudy)) {
      return false;
    }

    // Check required skills
    if (jobRequirements.requiredSkills) {
      const hasRequiredSkills = jobRequirements.requiredSkills.every(
        skill => applicant.skills && applicant.skills.includes(skill)
      );
      if (!hasRequiredSkills) {
        return false;
      }
    }

    // Check experience
    if (jobRequirements.minimumExperience && 
        (!applicant.experience || applicant.experience < jobRequirements.minimumExperience)) {
      return false;
    }

    return true;
  }).map(applicant => {
    // Calculate qualification score
    let score = 0;

    // Academic performance (40%)
    if (applicant.gpa) {
      score += (applicant.gpa / 4.0) * 40;
    }

    // Relevant certifications (30%)
    if (applicant.certifications && jobRequirements.preferredCertifications) {
      const relevantCerts = applicant.certifications.filter(
        cert => jobRequirements.preferredCertifications.includes(cert)
      );
      score += (relevantCerts.length / jobRequirements.preferredCertifications.length) * 30;
    }

    // Work experience (20%)
    if (applicant.experience) {
      const expScore = Math.min(applicant.experience / (jobRequirements.minimumExperience || 1), 2);
      score += expScore * 10;
    }

    // Additional skills (10%)
    if (applicant.skills && jobRequirements.preferredSkills) {
      const additionalSkills = applicant.skills.filter(
        skill => jobRequirements.preferredSkills.includes(skill)
      );
      score += (additionalSkills.length / jobRequirements.preferredSkills.length) * 10;
    }

    return {
      ...applicant,
      qualificationScore: Math.round(score)
    };
  }).sort((a, b) => b.qualificationScore - a.qualificationScore);
};

// Handle multiple institution admissions
export const handleMultipleAdmissions = async (studentId, acceptedInstitutionId, allApplications) => {
  const changes = [];

  for (const app of allApplications) {
    if (app.studentId === studentId && app.status === 'accepted') {
      if (app.institutionId === acceptedInstitutionId) {
        // Keep this admission
        changes.push({
          type: 'keep',
          applicationId: app.id,
          institutionId: app.institutionId
        });
      } else {
        // Remove from other institutions and promote waiting list
        changes.push({
          type: 'remove',
          applicationId: app.id,
          institutionId: app.institutionId,
          courseId: app.courseId
        });
      }
    }
  }

  return changes;
};

// Promote from waiting list
export const promoteFromWaitingList = async (institutionId, courseId) => {
  // This would get the first student from waiting list for the course
  // and promote them to the main acceptance list
  
  return {
    institutionId,
    courseId,
    action: 'promote_waiting_list'
  };
};

// Notification system utilities
export const createNotification = (userId, type, title, message, data = {}) => {
  return {
    userId,
    type, // 'admission', 'job_match', 'application_status', 'system'
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
    priority: data.priority || 'normal' // 'high', 'normal', 'low'
  };
};

// Email templates
export const emailTemplates = {
  admission_accepted: (studentName, institutionName, courseName) => ({
    subject: `Congratulations! Admission Accepted - ${courseName}`,
    body: `
      Dear ${studentName},
      
      Congratulations! We are pleased to inform you that your application for ${courseName} at ${institutionName} has been accepted.
      
      Please log in to your account to view next steps and required documentation.
      
      Best regards,
      Career Guidance Platform Team
    `
  }),

  job_match: (studentName, jobTitle, companyName) => ({
    subject: `New Job Opportunity: ${jobTitle}`,
    body: `
      Dear ${studentName},
      
      We found a job opportunity that matches your profile:
      
      Position: ${jobTitle}
      Company: ${companyName}
      
      Log in to view details and apply.
      
      Best regards,
      Career Guidance Platform Team
    `
  })
};

// File upload validation
export const validateFileUpload = (file, allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate unique application ID
export const generateApplicationId = (institutionCode, year) => {
  const timestamp = Date.now().toString().slice(-6);
  return `${institutionCode}-${year}-${timestamp}`;
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate academic year
export const getCurrentAcademicYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Academic year typically starts in August/September
  if (currentMonth >= 7) { // August onwards
    return `${currentYear}/${currentYear + 1}`;
  } else {
    return `${currentYear - 1}/${currentYear}`;
  }
};