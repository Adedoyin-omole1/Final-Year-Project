import TopNavbar from '../../Components/Navbar/TopNavbar';
import CourseAdviserSidebar from '../../Components/Sidebar/CourseAdviserSidebar';
import { FiUsers, FiBook, FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase'; // Adjust path as needed
import { doc, getDoc } from 'firebase/firestore';

const CourseAdviser = () => {
    // State for user details
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user details on component mount
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, "Users", user.uid));
                    if (userDoc.exists()) {
                        setUserDetails(userDoc.data());
                    }
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    // Sample data - replace with your actual data
    const stats = [
        { title: "Total Students", value: "142", icon: <FiUsers className="text-blue-500" />, change: "+12%", trend: "up" },
        { title: "Courses Advised", value: "8", icon: <FiBook className="text-green-500" />, change: "+2", trend: "up" },
        { title: "Pending Approvals", value: "23", icon: <FaChalkboardTeacher className="text-yellow-500" />, change: "5 new", trend: "up" },
        { title: "Upcoming Deadlines", value: "3", icon: <FiCalendar className="text-red-500" />, change: "2 urgent", trend: "down" }
    ];

    const recentStudents = [
        { name: "Alex Johnson", id: "STU2023001", department: "Computer Science", status: "Active" },
        { name: "Sarah Williams", id: "STU2023002", department: "ICT", status: "Pending" },
        { name: "Michael Brown", id: "STU2023003", department: "Physics", status: "Active" },
        { name: "Emily Davis", id: "STU2023004", department: "Biochemistry", status: "Inactive" }
    ];

    const recentActivities = [
        { action: "Approved course registration", student: "David Wilson", time: "10 mins ago", icon: <FiCheckCircle className="text-green-500" /> },
        { action: "Rejected incomplete form", student: "Lisa Moore", time: "25 mins ago", icon: <FiAlertCircle className="text-red-500" /> },
        { action: "Sent reminder email", student: "Group: CS 401", time: "1 hour ago", icon: <FiCheckCircle className="text-blue-500" /> },
        { action: "Updated course syllabus", course: "CSC 401", time: "2 hours ago", icon: <FiCheckCircle className="text-purple-500" /> }
    ];

    if (loading) {
        return (
            <div className="w-full flex h-screen overflow-hidden bg-gray-50">
                <CourseAdviserSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavbar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            <CourseAdviserSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg mb-6">
                            <h1 className="text-2xl font-bold">
                                Welcome back, {userDetails?.title || 'Dr.'} {userDetails?.firstName || 'Course Adviser'}
                            </h1>
                            <p className="opacity-90 mt-1">Here's what's happening with your students today</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex justify-between">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50">
                                            {stat.icon}
                                        </div>
                                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-gray-500 text-sm font-medium">{stat.title}</h3>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Students Section */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-lg text-gray-800">Recent Students</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentStudents.map((student, index) => (
                                        <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                                                    <p className="text-sm text-gray-500">{student.id} • {student.department}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        student.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {student.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-3 bg-gray-50 text-right">
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        View all students →
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activities Section */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-lg text-gray-800">Recent Activities</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mt-1 mr-3">
                                                    {activity.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.action}
                                                        {activity.student && (
                                                            <span className="text-blue-600"> {activity.student}</span>
                                                        )}
                                                        {activity.course && (
                                                            <span className="text-blue-600"> {activity.course}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-3 bg-gray-50 text-right">
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        View all activities →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-lg text-gray-800">Upcoming Deadlines</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Course Registration Deadline</h3>
                                            <p className="text-sm text-gray-500">For all 400 level students</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">May 30, 2023</p>
                                            <p className="text-xs text-red-500">3 days remaining</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Result Submission</h3>
                                            <p className="text-sm text-gray-500">CSC 401 - Advanced Programming</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">June 5, 2023</p>
                                            <p className="text-xs text-yellow-500">1 week remaining</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseAdviser;