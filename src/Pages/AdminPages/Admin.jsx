import React, { useState, useEffect } from 'react';
import {
  FaUniversity,
  FaUserGraduate,
  FaCalendarAlt,
  FaBell,
  FaUsers,
  FaBook,
  FaUserCog
} from 'react-icons/fa';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/navbar';
import { toast } from 'react-toastify';

const Admin = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    upcomingExams: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Verify admin status first
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (!userDoc.exists()) {
          throw new Error("User profile not found");
        }

        const userData = userDoc.data();
        setUserDetails(userData);

        if (userData.role !== "admin") {
          toast.error("Admin access required");
          navigate(userData.role === "courseAdviser" ? "/course-adviser" : "/student");
          return;
        }

        // Only query collections that are defined in Firebase rules
        const [usersSnap, courseRegsSnap, examRegsSnap, pendingApprovalsSnap] = await Promise.all([
          getDocs(collection(db, "Users")),
          getDocs(query(collection(db, "courseRegistrations"), where("status", "==", "active"))),
          getDocs(collection(db, "examRegistrations")),
          getDocs(query(collection(db, "courseApprovals"), where("status", "==", "pending")))
        ]);

        // Calculate stats from permitted collections
        const students = usersSnap.docs.filter(doc => doc.data().role === "student");

        setStats({
          totalStudents: students.length,
          activeCourses: courseRegsSnap.size,
          upcomingExams: examRegsSnap.size,
          pendingRequests: pendingApprovalsSnap.size
        });

      } catch (error) {
        console.error("Admin dashboard error:", error);
        toast.error(error.message || "Failed to load dashboard data");
        if (error.code === 'permission-denied') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(fetchData);
    return () => unsubscribe();
  }, [navigate]);

  // UI Components (remain exactly the same as your original)
  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500 hover:shadow-md transition-shadow`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{loading ? '...' : value}</p>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, path }) => (
    <div
      onClick={() => navigate(path)}
      className="flex flex-col items-center p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50"
    >
      <div className="p-3 mb-2 rounded-full bg-blue-50 text-blue-600">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
  );

  const ActivityItem = ({ icon, title, time, color }) => (
    <div className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-full bg-${color}-50 text-${color}-600 mt-1 mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">
                Welcome back, <span className="text-blue-600">{userDetails?.firstName || 'Admin'}</span>
              </h1>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-xs">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                icon={<FaUserGraduate size={18} />}
                title="Total Students"
                value={stats.totalStudents}
                color="blue"
              />
              <StatCard
                icon={<FaBook size={18} />}
                title="Active Courses"
                value={stats.activeCourses}
                color="green"
              />
              <StatCard
                icon={<FaCalendarAlt size={18} />}
                title="Upcoming Exams"
                value={stats.upcomingExams}
                color="purple"
              />
              <StatCard
                icon={<FaBell size={18} />}
                title="Pending Requests"
                value={stats.pendingRequests}
                color="red"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <QuickAction
                  icon={<FaUserGraduate size={16} />}
                  title="Manage Students"
                  path="/admin/view-students"
                />
                <QuickAction
                  icon={<FaUniversity size={16} />}
                  title="Seat Allocation"
                  path="/admin/create-hall"
                />
                <QuickAction
                  icon={<FaCalendarAlt size={16} />}
                  title="Exam Schedule"
                  path="/admin/exams"
                />
                <QuickAction
                  icon={<FaUsers size={16} />}
                  title="User Management"
                  path="/admin/users"
                />
                <QuickAction
                  icon={<FaBook size={16} />}
                  title="Course Setup"
                  path="/admin/courses"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Recent Activity</h2>
              <div className="space-y-2">
                <ActivityItem
                  icon={<FaUserCog size={14} />}
                  title="New student registration"
                  time="2 minutes ago"
                  color="blue"
                />
                <ActivityItem
                  icon={<FaCalendarAlt size={14} />}
                  title="Exam scheduled for CSC401"
                  time="1 hour ago"
                  color="green"
                />
                <ActivityItem
                  icon={<FaUniversity size={14} />}
                  title="Seat allocation updated"
                  time="3 hours ago"
                  color="purple"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;