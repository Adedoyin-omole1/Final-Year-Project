import React, { useEffect, useState } from 'react';
import {
  FaBell,
  FaCalendarAlt,
  FaUniversity,
  FaUserGraduate,
  FaPrint,
  FaClock,
  FaChair,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../Components/Sidebar/StudentSidebar';
import Navbar from '../../Components/Navbar/navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Elegant department colors mapping
const departmentColors = {
  'Computer Science': 'bg-blue-50 text-blue-700 border-blue-200',
  'Mathematics': 'bg-purple-50 text-purple-700 border-purple-200',
  'Physics': 'bg-red-50 text-red-700 border-red-200',
  'Chemistry': 'bg-green-50 text-green-700 border-green-200',
  'Biology': 'bg-teal-50 text-teal-700 border-teal-200',
  'Engineering': 'bg-amber-50 text-amber-700 border-amber-200',
  'default': 'bg-gray-50 text-gray-700 border-gray-200'
};

// Helper function to get the next exam from the timetable
const getNextExam = (timetable) => {
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const today = new Date().getDay();

  let currentDayIndex = today === 0 ? 0 : today - 1;
  if (currentDayIndex > 4) currentDayIndex = 0;

  for (let i = currentDayIndex; i < daysOrder.length; i++) {
    const day = daysOrder[i];
    if (timetable[day] && timetable[day].length > 0) {
      return {
        ...timetable[day][0],
        day
      };
    }
  }

  return null;
};

const NextExamCard = ({ exam }) => {
  if (!exam) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-300 rounded-lg p-5 mb-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Your Next Exam</h2>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {exam.courseCode} - {exam.courseTitle}
          </h3>
          <div className="flex items-center text-gray-600 mb-1">
            <FaCalendarAlt className="mr-2 text-blue-400" />
            <span>{exam.day}, {exam.examTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaUniversity className="mr-2 text-blue-400" />
            <span>{exam.venue}</span>
          </div>
        </div>
        <div className="bg-white px-3 py-1 rounded-full shadow-xs border border-blue-100">
          <span className="text-sm font-medium text-blue-700">
            {exam.day}
          </span>
        </div>
      </div>
    </div>
  );
};

const AllocationStatusCard = ({ allocation, department }) => {
  if (!allocation) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FaHourglassHalf className="mr-2 text-yellow-400" />
          Seat Allocation Status
        </h2>
        <p className="text-gray-500">No allocation data available</p>
      </div>
    );
  }

  const { status, hall, seat, approver } = allocation;

  const statusConfig = {
    approved: {
      icon: <FaCheckCircle className="mr-2 text-green-500" />,
      color: "green-300",
      title: "Allocation Approved",
    },
    pending: {
      icon: <FaHourglassHalf className="mr-2 text-yellow-400" />,
      color: "yellow-300",
      title: "Pending Approval",
    },
    rejected: {
      icon: <FaTimesCircle className="mr-2 text-red-400" />,
      color: "red-300",
      title: "Allocation Rejected",
    },
    default: {
      icon: <FaHourglassHalf className="mr-2 text-gray-400" />,
      color: "gray-300",
      title: "Allocation Status",
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.default;
  const deptColorClass = departmentColors[department] || departmentColors.default;

  return (
    <div className={`bg-white rounded-lg border-l-4 border-${currentStatus.color} shadow-sm`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            {currentStatus.icon}
            {currentStatus.title}
          </h2>
          {status === 'approved' && (
            <span className={`text-xs px-3 py-1.5 rounded-full ${deptColorClass} border font-medium`}>
              {department}
            </span>
          )}
        </div>

        {status === 'approved' ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Exam Hall:</span>
              <span className="font-medium text-gray-700">{hall}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seat Number:</span>
              <span className="font-medium text-gray-700">{seat}</span>
            </div>
            {approver && (
              <div className="flex justify-between">
                <span className="text-gray-600">Approved By:</span>
                <span className="font-medium text-gray-700">{approver}</span>
              </div>
            )}
          </div>
        ) : status === 'pending' ? (
          <p className="text-gray-600">
            Your seat allocation is currently being processed. You'll receive a notification once approved.
          </p>
        ) : status === 'rejected' ? (
          <div>
            <p className="text-gray-600 mb-2">Your registration has been rejected.</p>
            {allocation.rejectionReason && (
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm font-medium text-red-600">Reason:</p>
                <p className="text-red-500">{allocation.rejectionReason}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Please contact the exam office for assistance.</p>
        )}
      </div>
    </div>
  );
};

const Students = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [seatAllocation, setSeatAllocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextExam, setNextExam] = useState(null);
  const [allocation, setAllocation] = useState(null);

  const navigate = useNavigate();

  const timetable = {
    Monday: [
      { courseCode: "CSC401", courseTitle: "Artificial Intelligence", examTime: "9:00 AM - 11:00 AM", venue: "NAS 1- NAS 5" },
      { courseCode: "MTH402", courseTitle: "Numerical Methods", examTime: "12:00 PM - 2:00 PM", venue: "NAS 2" },
      { courseCode: "PHY403", courseTitle: "Quantum Physics", examTime: "3:00 PM - 5:00 PM", venue: "NAS 1-5" }
    ],
    Tuesday: [
      { courseCode: "CSC402", courseTitle: "Machine Learning", examTime: "9:00 AM - 11:00 AM", venue: "NAS 1- NAS 5" },
      { courseCode: "STA401", courseTitle: "Statistical Methods", examTime: "12:00 PM - 2:00 PM", venue: "NAS 2" },
      { courseCode: "EEE403", courseTitle: "Digital Electronics", examTime: "3:00 PM - 5:00 PM", venue: "NAS 1-5" }
    ],
    Wednesday: [
      { courseCode: "CSC403", courseTitle: "Cybersecurity", examTime: "9:00 AM - 11:00 AM", venue: "NAS 1- NAS 5" },
      { courseCode: "MTH404", courseTitle: "Abstract Algebra", examTime: "12:00 PM - 2:00 PM", venue: "NAS 2" },
      { courseCode: "PHY405", courseTitle: "Electromagnetism", examTime: "3:00 PM - 5:00 PM", venue: "NAS 1-5" }
    ],
    Thursday: [
      { courseCode: "CSC404", courseTitle: "Software Engineering", examTime: "9:00 AM - 11:00 AM", venue: "NAS 1- NAS 5" },
      { courseCode: "MTH405", courseTitle: "Real Analysis", examTime: "12:00 PM - 2:00 PM", venue: "NAS 2" },
      { courseCode: "BIO401", courseTitle: "Biochemistry", examTime: "3:00 PM - 5:00 PM", venue: "NAS 1-5" }
    ],
    Friday: [
      { courseCode: "CSC405", courseTitle: "Data Science", examTime: "9:00 AM - 11:00 AM", venue: "NAS 1- NAS 5" },
      { courseCode: "MTH406", courseTitle: "Differential Equations", examTime: "12:00 PM - 2:00 PM", venue: "NAS 2" },
      { courseCode: "CHE401", courseTitle: "Organic Chemistry", examTime: "3:00 PM - 5:00 PM", venue: "NAS 1-5" }
    ],
  };

  useEffect(() => {
    setNextExam(getNextExam(timetable));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);

          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserDetails(userDocSnap.data());
          }

          const seatAllocationDoc = await getDoc(doc(db, "seatAllocations", user.uid));
          if (seatAllocationDoc.exists()) {
            setSeatAllocation(seatAllocationDoc.data());
          }

          const examRegQuery = query(
            collection(db, "examRegistrations"),
            where("email", "==", user.email)
          );
          const unsubscribeAllocation = onSnapshot(examRegQuery, (querySnapshot) => {
            if (!querySnapshot.empty) {
              setAllocation(querySnapshot.docs[0].data());
            }
          });

          const notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("read", "==", false)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setNotifications(notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          return () => unsubscribeAllocation();
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load data. Please refresh the page.");
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const quickActions = [
    { id: 1, title: "Select Exam Hall", icon: <FaUniversity className="text-blue-500" />, path: "/student/select-hall" },
    { id: 2, title: "Exam Timetable", icon: <FaCalendarAlt className="text-blue-500" />, path: "/student/exam-timetable" },
    { id: 3, title: "Contact Support", icon: <FaUserGraduate className="text-blue-500" />, path: "/student/support" },
  ];

  return (
    <div className='w-full flex h-screen overflow-hidden bg-gray-50'>
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6 overflow-y-auto">
          <ToastContainer position="top-right" autoClose={5000} />

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Welcome, <span className="text-blue-600">{userDetails?.firstName || 'Student'}</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {userDetails?.department && (
                    <span className={`text-xs px-3 py-1.5 rounded-full ${departmentColors[userDetails.department] || departmentColors.default} border font-medium`}>
                      {userDetails.department}
                    </span>
                  )}
                </div>
              </div>

              <NextExamCard exam={nextExam} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <AllocationStatusCard allocation={allocation} department={userDetails?.department} />

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => navigate(action.path)}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <span className="text-xl mr-3 text-blue-500">{action.icon}</span>
                        <span className="text-gray-700 font-medium">{action.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
                  {notifications.length > 0 && (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1.5 rounded-full border border-blue-200 font-medium">
                      {notifications.length} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {notifications.slice(0, 3).map((notification) => (
                      <li key={notification.id} className="py-3">
                        <p className="text-sm font-medium text-gray-700">{notification.message}</p>
                        <time className="text-xs text-gray-500">
                          {notification.date}
                        </time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No new notifications</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;