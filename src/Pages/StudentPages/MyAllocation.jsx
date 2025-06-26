import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import StudentSidebar from "../../Components/Sidebar/StudentSidebar";

// Enhanced color mappings with better contrast
const hallColors = {
    'NAS 1': 'border-sky-600 bg-sky-50',         // Cool blue
    'NAS 2': 'border-emerald-600 bg-emerald-50', // Vibrant green
    'NAS 3': 'border-amber-600 bg-amber-50',     // Deep yellow
    'NAS 4': 'border-violet-600 bg-violet-50',   // Strong purple
    'NAS 5': 'border-rose-600 bg-rose-50',       // Bold pink/red
};

const departmentColors = {
    'computer science': 'bg-red-100 text-red-800',
    'ict': 'bg-emerald-100 text-emerald-800',
    'mathematics': 'bg-violet-100 text-violet-800',
    'physics': 'bg-indigo-100 text-indigo-800',
    'chemistry': 'bg-pink-100 text-pink-800',
    'biology': 'bg-green-100 text-green-800',
    'micro-biology': 'bg-blue-100 text-blue-800',
    'electrical engineering': 'bg-orange-100 text-orange-800',
    'mechanical engineering': 'bg-amber-100 text-amber-800',
};

const MyAllocation = () => {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setError("Please log in to view your allocation.");
                setLoading(false);
                return;
            }

            const userRef = doc(db, "Users", user.uid);
            const unsubscribeUser = onSnapshot(
                userRef,
                (userDoc) => {
                    if (!userDoc.exists()) {
                        setError("User profile not found.");
                        setLoading(false);
                        return;
                    }

                    const userData = userDoc.data();
                    const userEmail = user.email;

                    if (!userEmail) {
                        setError("Email not found in your profile.");
                        setLoading(false);
                        return;
                    }

                    const q = query(
                        collection(db, "examRegistrations"),
                        where("email", "==", userEmail)
                    );

                    const unsubscribeAllocation = onSnapshot(
                        q,
                        (querySnapshot) => {
                            if (!querySnapshot.empty) {
                                const docData = querySnapshot.docs[0].data();
                                setAllocation(docData);
                                setError("");
                            } else {
                                setAllocation(null);
                                setError("No exam registration found for your email.");
                            }
                            setLoading(false);
                        },
                        (error) => {
                            console.error("Error fetching allocation:", error);
                            setError("Error fetching allocation data.");
                            setLoading(false);
                        }
                    );

                    return () => unsubscribeAllocation();
                },
                (error) => {
                    console.error("Error fetching user data:", error);
                    setError("Error fetching user profile.");
                    setLoading(false);
                }
            );

            return () => unsubscribeUser();
        });

        return () => unsubscribeAuth();
    }, []);

    const renderStatusCard = () => {
        if (!allocation) return null;

        const { status, hall, seat, approver, courses, rejectionReason } = allocation;
        const department = allocation.department?.toLowerCase() || '';

        const hallBorderColor = hallColors[hall] || 'border-gray-500 bg-gray-50';
        const departmentBgColor = departmentColors[department] || 'bg-gray-100 text-gray-800';

        const statusInfo = {
            approved: {
                color: "green",
                iconPath: "M5 13l4 4L19 7",
                title: "Allocation Approved",
                content: (
                    <div className="space-y-4">
                        <div className={`p-3 ${departmentBgColor} rounded-lg flex items-center justify-between`}>
                            <span className="text-xs font-medium px-2 py-1 rounded">
                                {allocation.department}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Hall</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{hall}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Number</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{seat}</p>
                            </div>
                        </div>
                        {approver && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">{approver}</p>
                            </div>
                        )}
                    </div>
                ),
            },
            pending: {
                color: "yellow",
                iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Pending Approval",
                content: (
                    <>
                        <p className="text-gray-600">
                            Your seat allocation is currently being processed.
                        </p>
                        <div className="mt-3 bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-800">
                            You'll receive a notification once it's approved.
                        </div>
                    </>
                ),
            },
            rejected: {
                color: "red",
                iconPath: "M6 18L18 6M6 6l12 12",
                title: "Allocation Rejected",
                content: (
                    <>
                        <p className="text-gray-600">Your registration has been rejected.</p>
                        {rejectionReason && (
                            <div className="mt-3 bg-red-50 p-3 rounded-md border border-red-100">
                                <p className="text-sm font-medium text-red-700">Reason:</p>
                                <p className="text-red-600">{rejectionReason}</p>
                            </div>
                        )}
                    </>
                ),
            },
        };

        const currentStatus = statusInfo[status] || {
            color: "gray",
            iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            title: "Status Unknown",
            content: <p className="text-gray-600">Please contact the exam office for help.</p>,
        };

        return (
            <div className={`bg-white rounded-xl shadow-sm border-l-4 ${hallBorderColor.split(' ')[0]} h-full overflow-hidden`}>
                <div className={`p-5 h-full flex flex-col ${hallBorderColor.split(' ')[1]}`}>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className={`bg-${currentStatus.color}-100 p-2 rounded-full flex-shrink-0`}>
                            <svg
                                className={`h-5 w-5 text-${currentStatus.color}-600`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentStatus.iconPath} />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{currentStatus.title}</h2>
                    </div>
                    <div className="flex-grow">
                        {currentStatus.content}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <StudentSidebar />

            <div className="flex-1 overflow-auto p-6">
                <div className="h-full flex flex-col">
                    {/* Enhanced Header Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    View your exam allocation details
                                </p>
                            </div>
                            <div className="bg-white px-3 py-2 rounded-lg shadow-xs border border-gray-100">
                                <p className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mt-4">My Exam Allocation</h2>
                    </div>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-center">
                                <p className="text-gray-700 font-medium">Fetching your allocation</p>
                                <p className="text-gray-500 text-sm mt-1">This may take a moment...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-red-500">
                            <div className="flex items-start space-x-3">
                                <div className="text-red-500 pt-0.5">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-red-600">Error</h3>
                                    <p className="text-gray-600">{error}</p>
                                    <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800">
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : allocation ? (
                        <div className="flex-grow flex flex-col space-y-6 h-full">
                            {/* Enhanced Student Information Card */}
                            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Student Information</h2>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.name}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.email}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.department}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.level}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Status and Courses Section */}
                            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                {/* Status Card */}
                                <div className="lg:col-span-1 h-full">
                                    {renderStatusCard()}
                                </div>

                                {/* Enhanced Registered Courses Card */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 h-full flex flex-col border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800">Registered Courses</h2>
                                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                            {allocation.courses?.length || 0} courses
                                        </span>
                                    </div>
                                    <ul className="space-y-3 overflow-auto flex-grow">
                                        {allocation.courses?.map((course, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                                            >
                                                <span className="text-gray-500 text-sm mr-2 mt-0.5">{index + 1}.</span>
                                                <span className="text-gray-800 flex-grow">{course}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    Registered
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MyAllocation;