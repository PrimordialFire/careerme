// Firebase service functions for the application
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

// User Services
export const userService = {
  // Get user by ID
  async getUser(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      toast.error('Failed to fetch user data');
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(uid, userData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...userData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }
};

// Institution Services
export const institutionService = {
  // Create new institution
  async createInstitution(institutionData) {
    try {
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...institutionData,
        createdAt: new Date(),
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error;
    }
  },

  // Get all institutions
  async getInstitutions() {
    try {
      const querySnapshot = await getDocs(collection(db, 'institutions'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  },

  // Update institution
  async updateInstitution(id, data) {
    try {
      await updateDoc(doc(db, 'institutions', id), {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      throw error;
    }
  },

  // Delete institution
  async deleteInstitution(id) {
    try {
      await deleteDoc(doc(db, 'institutions', id));
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw error;
    }
  }
};

// Course Services
export const courseService = {
  // Create new course
  async createCourse(courseData) {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: new Date(),
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Get courses by institution
  async getCoursesByInstitution(institutionId) {
    try {
      const q = query(collection(db, 'courses'), where('institutionId', '==', institutionId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get all courses
  async getAllCourses() {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  },

  // Update course
  async updateCourse(id, data) {
    try {
      await updateDoc(doc(db, 'courses', id), {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }
};

// Application Services
export const applicationService = {
  // Submit course application
  async submitApplication(applicationData) {
    try {
      // Check if student already has 2 applications for this institution
      const existingApps = await this.getApplicationsByStudent(
        applicationData.studentId, 
        applicationData.institutionId
      );
      
      if (existingApps.length >= 2) {
        throw new Error('Maximum of 2 applications per institution allowed');
      }

      const docRef = await addDoc(collection(db, 'applications'), {
        ...applicationData,
        status: 'pending',
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  // Get applications by student
  async getApplicationsByStudent(studentId, institutionId = null) {
    try {
      let q;
      if (institutionId) {
        q = query(
          collection(db, 'applications'), 
          where('studentId', '==', studentId),
          where('institutionId', '==', institutionId)
        );
      } else {
        q = query(collection(db, 'applications'), where('studentId', '==', studentId));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching student applications:', error);
      throw error;
    }
  },

  // Get applications by institution
  async getApplicationsByInstitution(institutionId) {
    try {
      const q = query(collection(db, 'applications'), where('institutionId', '==', institutionId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching institution applications:', error);
      throw error;
    }
  },

  // Update application status
  async updateApplicationStatus(id, status, remarks = '') {
    try {
      await updateDoc(doc(db, 'applications', id), {
        status,
        remarks,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }
};

// Job Services
export const jobService = {
  // Create job posting
  async createJobPosting(jobData) {
    try {
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: new Date(),
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  },

  // Get jobs by company
  async getJobsByCompany(companyId) {
    try {
      const q = query(collection(db, 'jobs'), where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  },

  // Get all active jobs
  async getAllJobs() {
    try {
      const q = query(
        collection(db, 'jobs'), 
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      throw error;
    }
  },

  // Apply for job
  async applyForJob(applicationData) {
    try {
      const docRef = await addDoc(collection(db, 'jobApplications'), {
        ...applicationData,
        status: 'pending',
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  // Get job applications
  async getJobApplications(jobId) {
    try {
      const q = query(collection(db, 'jobApplications'), where('jobId', '==', jobId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  }
};

// Waiting List Services
export const waitingListService = {
  // Promote first student from waiting list to admitted
  async promoteFromWaitingList(institutionId, courseId, courseName) {
    try {
      // Get all waiting applications for this course at this institution
      const allAppsSnapshot = await getDocs(collection(db, 'applications'));
      const waitingApps = allAppsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(app => 
          (app.institutionId === institutionId || app.institutionName) &&
          (app.courseId === courseId || app.course === courseName) &&
          app.status === 'waiting'
        )
        .sort((a, b) => {
          const aTime = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
          const bTime = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
          return aTime - bTime;
        });
      
      if (waitingApps.length > 0) {
        const waitingApp = waitingApps[0];
        await updateDoc(doc(db, 'applications', waitingApp.id), {
          status: 'admitted',
          promotedAt: new Date(),
          promotedFrom: 'waiting'
        });
        return { id: waitingApp.id, ...waitingApp };
      }
      
      return null;
    } catch (error) {
      console.error('Error promoting from waiting list:', error);
      throw error;
    }
  },

  // Get waiting list count for a course
  async getWaitingListCount(institutionId, courseId) {
    try {
      const allAppsSnapshot = await getDocs(collection(db, 'applications'));
      const waitingCount = allAppsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(app => 
          app.institutionId === institutionId &&
          app.courseId === courseId &&
          app.status === 'waiting'
        ).length;
      
      return waitingCount;
    } catch (error) {
      console.error('Error getting waiting list count:', error);
      throw error;
    }
  }
};
