import React, { useState, useEffect } from 'react';
import {
    FiBook,
    FiChevronDown,
    FiChevronRight,
    FiFilter,
    FiCheck,
    FiX,
    FiClock
} from 'react-icons/fi';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { db, auth } from '../../firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    addDoc,
    getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../../Components/Navbar/TopNavbar';

const departmentCourses = {
    "Computer Science": [
        { code: "CSC101", title: "Introduction to Computing", creditUnits: 3 },
        { code: "CSC102", title: "Fundamentals of Programming", creditUnits: 3 },
        { code: "MTH101", title: "Mathematics for Computing", creditUnits: 2 },
        { code: "PHY101", title: "Physics for Computer Science", creditUnits: 2 },
        { code: "CSC201", title: "Data Structures", creditUnits: 3 },
        { code: "CSC202", title: "Object-Oriented Programming", creditUnits: 3 },
        { code: "CSC203", title: "Database Management", creditUnits: 3 },
        { code: "CSC204", title: "Operating Systems", creditUnits: 3 },
        { code: "CSC301", title: "Computer Networks", creditUnits: 3 },
        { code: "CSC302", title: "Software Engineering", creditUnits: 3 },
        { code: "CSC303", title: "Cybersecurity", creditUnits: 3 },
        { code: "CSC304", title: "Artificial Intelligence", creditUnits: 3 },
        { code: "CSC404", title: "Artificial Intelligence II", creditUnits: 3 },
    ],
    "ICT": [
        { code: "ICT101", title: "Circuit Theory I", creditUnits: 3 },
        { code: "ICT102", title: "Digital Electronics", creditUnits: 3 },
        { code: "ICT201", title: "Electrical Machines", creditUnits: 3 },
        { code: "ICT202", title: "Power Systems", creditUnits: 3 },
        { code: "ICT301", title: "Control Systems", creditUnits: 3 },
        { code: "ICT302", title: "Power Electronics", creditUnits: 3 },
        { code: "ICT303", title: "Microprocessors & Embedded Systems", creditUnits: 3 },
        { code: "ICT304", title: "High Voltage Engineering", creditUnits: 3 },
        { code: "ICT401", title: "Renewable Energy Systems", creditUnits: 3 },
        { code: "ICT402", title: "Industrial Automation", creditUnits: 3 }
    ],
    "Industrial Chemistry": [
        { code: "ICH101", title: "Principles of Management", creditUnits: 2 },
        { code: "ICH102", title: "Business Communication", creditUnits: 2 },
        { code: "ICH201", title: "Organizational Behavior", creditUnits: 2 },
        { code: "ICH202", title: "Business Law", creditUnits: 2 },
        { code: "ICH301", title: "Entrepreneurship Development", creditUnits: 2 },
        { code: "ICH302", title: "Business Finance", creditUnits: 2 },
        { code: "ICH303", title: "Corporate Governance", creditUnits: 2 },
        { code: "ICH304", title: "Strategic Management", creditUnits: 2 },
        { code: "ICH401", title: "International Business", creditUnits: 2 },
        { code: "ICH402", title: "E-commerce & Digital Marketing", creditUnits: 2 }
    ],
    "Micro-Biology": [
        { code: "MCB101", title: "Introduction to Biology", creditUnits: 2 },
        { code: "MCB102", title: "Introduction of In-Organic Chemistry", creditUnits: 2 },
        { code: "MCB203", title: "Basic Techniques In Microbiology", creditUnits: 3 },
        { code: "MCB201", title: "General Microbiology", creditUnits: 3 },
        { code: "MCB322", title: "Bio-deterioration", creditUnits: 3 },
        { code: "MCB324", title: "Medical Virology", creditUnits: 3 },
        { code: "MCB320", title: "Food Microbiology", creditUnits: 3 },
        { code: "MCB314", title: "Plant Pathology", creditUnits: 3 },
        { code: "MCB401", title: "Organic Chemistry", creditUnits: 3 },
        { code: "MCB402", title: "Biological Terms", creditUnits: 2 }
    ],
    "Physics": [
        { code: "PHY101", title: "General Physics I", creditUnits: 3 },
        { code: "PHY102", title: "General Physics II", creditUnits: 3 },
        { code: "PHY203", title: "Classical Mechanics", creditUnits: 3 },
        { code: "PHY201", title: "Thermodynamics", creditUnits: 3 },
        { code: "PHY322", title: "Quantum Mechanics", creditUnits: 3 },
        { code: "PHY324", title: "Electromagnetism", creditUnits: 3 },
        { code: "PHY320", title: "Solid State Physics", creditUnits: 3 },
        { code: "PHY314", title: "Nuclear Physics", creditUnits: 3 },
        { code: "PHY401", title: "Advanced Physics I", creditUnits: 3 },
        { code: "PHY402", title: "Advanced Physics II", creditUnits: 3 }
    ]
};

const CourseRegistration = () => {
    const [selectedLevel, setSelectedLevel] = useState('');
    const [expandedCourses, setExpandedCourses] = useState({});
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [semesterFilter, setSemesterFilter] = useState('First Semester');
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [userDepartment, setUserDepartment] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    const navigate = useNavigate();

    const levels = ['100 Level', '200 Level', '300 Level', '400 Level'];
    const semesters = ['First Semester', 'Second Semester'];
    const departments = Object.keys(departmentCourses);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthInitialized(true);
            if (user) {
                fetchUserData(user.uid);
            } else {
                setUserRole(null);
                setUserDepartment(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'Users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserRole(userData.role);
                setUserDepartment(userData.department);

                if (userData.role === 'admin' && departments.length > 0) {
                    setSelectedDepartment(departments[0]);
                } else {
                    setSelectedDepartment(userData.department);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load user information");
        }
    };

    useEffect(() => {
        let unsubscribe;

        const fetchData = async () => {
            if (!selectedLevel || !selectedDepartment) {
                setRegistrations([]);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, 'examRegistrations'),
                    // where('level', '==', selectedLevel),
                    // where('department', '==', selectedDepartment),
                    // where('semester', '==', semesterFilter)
                );

                unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const registrationsData = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        registrationsData.push({
                            id: doc.id,
                            ...data,
                            timestamp: data.timestamp?.toDate()?.toLocaleString() || 'N/A'
                        });
                    });

                    setRegistrations(registrationsData);
                    setLoading(false);
                }, (error) => {
                    console.error("Query error:", error);
                    toast.error("Failed to load registrations");
                    setLoading(false);
                });

            } catch (error) {
                console.error("Error setting up listener:", error);
                toast.error("Failed to load registrations");
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [selectedLevel, selectedDepartment, semesterFilter]);

    const sendNotification = async (studentId, message) => {
        try {
            if (userRole !== 'admin' && userRole !== 'courseAdviser') {
                toast.error("You don't have permission to send notifications");
                return;
            }

            await addDoc(collection(db, "notifications"), {
                userId: studentId,
                message: message,
                read: false,
                timestamp: serverTimestamp(),
                type: "course_approval"
            });
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    const toggleCourseExpansion = (courseCode) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseCode]: !prev[courseCode]
        }));
    };

    const handleApproveCourse = async (registrationId, courseCode, studentId) => {
        try {
            if (!auth.currentUser) {
                toast.error("You must be logged in to approve courses");
                return;
            }

            if (userRole !== 'admin' && userRole !== 'courseAdviser') {
                toast.error("You don't have permission to approve courses");
                return;
            }

            const registrationDoc = doc(db, 'examRegistrations', registrationId);
            await updateDoc(registrationDoc, {
                status: 'approved',
                approvedAt: serverTimestamp(),
                approvedBy: {
                    uid: auth.currentUser.uid,
                    name: auth.currentUser.displayName || 'Course Adviser'
                }
            });

            await sendNotification(
                studentId,
                `Your course registration has been approved by your course adviser`
            );

            toast.success("Registration approved successfully");
        } catch (error) {
            console.error("Error approving registration:", error);
            toast.error(`Failed to approve: ${error.message}`);
        }
    };

    const handleRejectCourse = async (registrationId, courseCode, studentId) => {
        try {
            if (!auth.currentUser) {
                toast.error("You must be logged in to reject courses");
                return;
            }

            if (userRole !== 'admin' && userRole !== 'courseAdviser') {
                toast.error("You don't have permission to reject courses");
                return;
            }

            const registrationDoc = doc(db, 'examRegistrations', registrationId);
            await updateDoc(registrationDoc, {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                rejectedBy: {
                    uid: auth.currentUser.uid,
                    name: auth.currentUser.displayName || 'Course Adviser'
                },
                rejectionReason: "Please contact your course adviser for details"
            });

            await sendNotification(
                studentId,
                `Your course registration has been rejected. Please contact your course adviser.`
            );

            toast.success("Registration rejected");
        } catch (error) {
            console.error("Error rejecting registration:", error);
            toast.error(`Failed to reject: ${error.message}`);
        }
    };

    const groupByCourse = () => {
        const courseMap = {};

        registrations.forEach(reg => {
            if (!reg.courses) {
                console.warn('Registration has no courses:', reg.id);
                return;
            }

            const formatDate = (timestamp) => {
                if (!timestamp) return 'N/A';
                if (timestamp instanceof Date) return timestamp.toLocaleString();
                if (typeof timestamp?.toDate === 'function') return timestamp.toDate().toLocaleString();
                if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
                return 'N/A';
            };

            let coursesList = [];

            if (Array.isArray(reg.courses)) {
                coursesList = reg.courses.map(course => {
                    if (typeof course === 'string') {
                        const [code, ...titleParts] = course.split(' - ');
                        return {
                            code: code.trim().replace(/\s+/g, ''),
                            title: titleParts.join(' - ').trim(),
                            status: reg.status || 'pending',
                            creditUnits: 0
                        };
                    }
                    return {
                        code: course.code || course.courseCode,
                        title: course.title || course.name || course.code,
                        status: course.status || reg.status || 'pending',
                        creditUnits: course.creditUnits || course.unit || 0
                    };
                });
            } else if (typeof reg.courses === 'object' && !Array.isArray(reg.courses)) {
                coursesList = Object.entries(reg.courses).map(([code, details]) => ({
                    code,
                    title: details.title || details.name || code,
                    status: details.status || reg.status || 'pending',
                    creditUnits: details.creditUnits || details.unit || 0
                }));
            }

            coursesList.forEach(course => {
                if (!course.code) {
                    console.warn('Course missing code:', course);
                    return;
                }

                const courseKey = course.code.toUpperCase();

                if (!courseMap[courseKey]) {
                    courseMap[courseKey] = {
                        title: course.title,
                        code: course.code,
                        creditUnits: course.creditUnits,
                        students: []
                    };
                }

                courseMap[courseKey].students.push({
                    studentId: reg.matricNumber || reg.studentId || reg.userId || 'N/A',
                    studentName: reg.name || reg.studentName || 'Unknown Student',
                    registrationId: reg.id,
                    registrationDate: formatDate(reg.timestamp),
                    status: course.status,
                    approvalDate: course.status === 'approved'
                        ? formatDate(reg.approvedAt)
                        : course.status === 'rejected'
                            ? formatDate(reg.rejectedAt)
                            : 'N/A',
                    rawData: reg
                });
            });
        });

        return courseMap;
    };

    const courseGroups = groupByCourse();

    const filteredCourses = () => {
        const filtered = {};
        Object.entries(courseGroups).forEach(([courseCode, courseData]) => {
            const filteredStudents = courseData.students.filter(student =>
                student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredStudents.length > 0) {
                filtered[courseCode] = {
                    ...courseData,
                    students: filteredStudents
                };
            }
        });
        return filtered;
    };

    const displayCourseGroups = searchTerm ? filteredCourses() : courseGroups;

    const getDepartmentCourses = () => {
        if (!selectedDepartment || !departmentCourses[selectedDepartment]) return [];
        return departmentCourses[selectedDepartment];
    };

    const ApprovalBadge = ({ status }) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs flex items-center";
        if (status === 'approved') {
            return (
                <span className={`${baseClasses} bg-green-100 text-green-800`}>
                    <FiCheck className="mr-1" /> Approved
                </span>
            );
        } else if (status === 'rejected') {
            return (
                <span className={`${baseClasses} bg-red-100 text-red-800`}>
                    <FiX className="mr-1" /> Rejected
                </span>
            );
        }
        return (
            <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                <FiClock className="mr-1" /> Pending
            </span>
        );
    };

    if (!authInitialized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!auth.currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Session expired</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Please log in again to access this page
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">Course Registrations</h1>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Academic Level
                                </label>
                                <select
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                >
                                    <option value="">Select Level</option>
                                    {levels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Semester
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiFilter className="text-gray-400" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={semesterFilter}
                                        onChange={(e) => setSemesterFilter(e.target.value)}
                                    >
                                        {semesters.map(semester => (
                                            <option key={semester} value={semester}>{semester}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                {userRole === 'admin' ? (
                                    <select
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={selectedDepartment || ''}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                        value={userDepartment || 'Not assigned'}
                                        readOnly
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Students
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name or ID"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : selectedLevel && selectedDepartment ? (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold text-lg text-gray-800">
                                            {selectedDepartment} - {selectedLevel}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {registrations.length} students registered • {semesterFilter}
                                        </p>
                                    </div>
                                </div>

                                {getDepartmentCourses().length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {getDepartmentCourses().map((course) => {
                                            const courseData = displayCourseGroups[course.code] || {
                                                title: course.title,
                                                code: course.code,
                                                students: [],
                                                creditUnits: course.creditUnits
                                            };

                                            return (
                                                <div key={course.code} className="px-6">
                                                    <div className="w-full flex justify-between items-center py-4">
                                                        <div className="flex items-center">
                                                            <FiBook className="mr-3 text-blue-500" />
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">
                                                                    {course.title} ({course.code})
                                                                </h3>
                                                                <div className="flex items-center mt-1 space-x-4">
                                                                    <span className="text-sm text-gray-500">
                                                                        {courseData.students.length} students registered
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {course.creditUnits} CU
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => toggleCourseExpansion(course.code)}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                {expandedCourses[course.code] ? (
                                                                    <FiChevronDown className="h-5 w-5" />
                                                                ) : (
                                                                    <FiChevronRight className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {expandedCourses[course.code] && (
                                                        <div className="pl-14 pb-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="text-sm font-medium text-gray-700">
                                                                    Registered Students ({courseData.students.length})
                                                                </h4>
                                                            </div>
                                                            {courseData.students.length > 0 ? (
                                                                <ul className="space-y-3">
                                                                    {courseData.students.map((student, index) => (
                                                                        <li key={index} className="text-sm text-gray-600">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center">
                                                                                    <span className="inline-block w-6 text-gray-400">{index + 1}.</span>
                                                                                    <span className="font-medium">{student.studentName}</span>
                                                                                    <span className="mx-2 text-gray-300">•</span>
                                                                                    <span className="text-gray-500">{student.studentId}</span>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2">
                                                                                    <ApprovalBadge status={student.status} />
                                                                                    {(userRole === 'admin' || userRole === 'courseAdviser') && (
                                                                                        <>
                                                                                            <button
                                                                                                onClick={() => handleApproveCourse(student.registrationId, course.code, student.studentId)}
                                                                                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                                                                                title="Approve this course"
                                                                                                disabled={loading}
                                                                                            >
                                                                                                <FiCheck />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleRejectCourse(student.registrationId, course.code, student.studentId)}
                                                                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                                                                title="Reject this course"
                                                                                                disabled={loading}
                                                                                            >
                                                                                                <FiX />
                                                                                            </button>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="ml-6 text-xs text-gray-400 mt-1">
                                                                                Registered: {student.registrationDate}
                                                                                {student.approvalDate !== 'N/A' && (
                                                                                    <span className="ml-2">
                                                                                        • {student.status === 'approved' ? 'Approved' : 'Rejected'}: {student.approvalDate}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">No students have registered for this course yet.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No courses found for {selectedDepartment}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {!selectedLevel ? 'Select an academic level' : 'Select a department'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Please select a level and department to view course registrations
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseRegistration;