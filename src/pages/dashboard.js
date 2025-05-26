'use client'

// src/pages/dashboard.js
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import AuthGuard from '../components/AuthGuard';
import ResumeForm from '../components/ResumeForm';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [applications, setApplications] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);

  console.log('Dashboard render - user:', user);

  useEffect(() => {
    console.log('Dashboard: Auth state:', { user, authLoading });
    
    if (!authLoading && !user) {
      console.log('Dashboard: No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (user) {
      loadUserData();
      loadApplications();
      // Check if this is first visit
      const hasVisited = localStorage.getItem('hasVisitedDashboard');
      if (!hasVisited) {
        setShowTutorial(true);
        localStorage.setItem('hasVisitedDashboard', 'true');
      }
    }
  }, [user, authLoading, router]);

  const loadUserData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('Dashboard: Loading data for user:', user.uid);
      
      const docRef = doc(db, 'resumes', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Dashboard: Resume data found');
        setResumeData(docSnap.data());
      } else {
        console.log('Dashboard: No resume found');
        setResumeData(null);
      }
    } catch (error) {
      console.error('Dashboard: Error loading data:', error);
      setError('Error loading your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!user) return;
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Loaded applications:', apps);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume Section */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Your Resume</h2>
                {editMode ? (
                  <ResumeForm 
                    initialData={resumeData} 
                    onSuccess={() => {
                      setEditMode(false);
                      loadUserData();
                    }} 
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Resume Preview</h3>
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Edit Resume
                      </button>
                    </div>
                    {resumeData ? (
                      <div>
                        <h3 className="font-semibold">{resumeData.name}</h3>
                        <p className="text-gray-600">{resumeData.contact?.email}</p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-gray-500 mb-4">No resume found</p>
                        <button
                          onClick={() => setEditMode(true)}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          Create Resume
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Applications Section */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div key={app.id} className="border p-3 rounded">
                        <h3 className="font-semibold">{app.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{app.company}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            app.status === 'Applied' ? 'bg-blue-100' :
                            app.status === 'Interview' ? 'bg-yellow-100' :
                            app.status === 'Offer' ? 'bg-green-100' :
                            'bg-red-100'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500 mb-4">No applications yet</p>
                    <button
                      onClick={() => router.push('/applications/new')}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Track New Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}