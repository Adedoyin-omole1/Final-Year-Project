import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import StudentSidebar from "../../Components/Sidebar/StudentSidebar";

const MyAllocation = () => {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

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
    }, []);

    const renderStatusCard = () => {
        if (!allocation) return null;

        const { status, hall, seat, approver, courses, rejectionReason } = allocation;

        const statusInfo = {
            approved: {
                color: "green",
                iconPath: "M5 13l4 4L19 7",
                title: "Allocation Approved",
                content: (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Exam Hall</p>
                                <p className="text-xl font-semibold text-gray-800">{hall}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Seat Number</p>
                                <p className="text-xl font-semibold text-gray-800">{seat}</p>
                            </div>
                        </div>
                        {approver && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-500">Approved By</p>
                                <p className="text-base font-medium text-gray-700">{approver}</p>
                            </div>
                        )}
                    </>
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
                        <div className="mt-3 bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
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
                            <div className="mt-3 bg-red-50 p-3 rounded-md">
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
            <div className={`bg-white rounded-xl shadow-sm border-l-4 border-${currentStatus.color}-500 h-full`}>
                <div className="p-5 h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className={`bg-${currentStatus.color}-100 p-2 rounded-full`}>
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
                    {/* Header Section */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                        <div className="flex items-center justify-between mt-2">
                            <h2 className="text-xl font-semibold text-gray-700">My Exam Allocation</h2>
                            <p className="text-sm text-gray-500">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-600 mt-4">Fetching your allocation details...</p>
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
                                </div>
                            </div>
                        </div>
                    ) : allocation ? (
                        <div className="flex-grow flex flex-col space-y-5">
                            {/* Student Information Card */}
                            <div className="bg-white rounded-xl shadow-sm p-5">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Department</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Level</p>
                                        <p className="text-base font-medium text-gray-800 mt-1">{allocation.level}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status and Courses Section */}
                            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Status Card */}
                                <div className="lg:col-span-1">
                                    {renderStatusCard()}
                                </div>

                                {/* Registered Courses Card */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Registered Courses</h2>
                                    <ul className="space-y-3">
                                        {allocation.courses?.map((course, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-gray-500 text-sm mr-2 mt-0.5">{index + 1}.</span>
                                                <span className="text-gray-800">{course}</span>
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