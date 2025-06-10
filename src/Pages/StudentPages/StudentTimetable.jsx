import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from "../../Components/Sidebar/StudentSidebar";
import Navbar from '../../Components/Navbar/navbar';

const StudentTimetable = () => {
    const navigate = useNavigate();

    // Static weekly exam timetable with 3 courses per day
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

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <StudentSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <Navbar />

                {/* Timetable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="mr-2">📅</span> Exam Timetable
                            </h2>

                            <div className="space-y-8">
                                {Object.entries(timetable).map(([day, exams]) => (
                                    <div key={day} className="mb-8 last:mb-0">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-4 px-2 py-1 bg-blue-50 rounded-md inline-block">
                                            {day}
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-3 text-left border-b-2 border-gray-200">Course Code</th>
                                                        <th className="p-3 text-left border-b-2 border-gray-200">Course Title</th>
                                                        <th className="p-3 text-left border-b-2 border-gray-200">Exam Time</th>
                                                        <th className="p-3 text-left border-b-2 border-gray-200">Venue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exams.map((exam, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                                                        >
                                                            <td className="p-3">{exam.courseCode}</td>
                                                            <td className="p-3">{exam.courseTitle}</td>
                                                            <td className="p-3">{exam.examTime}</td>
                                                            <td className="p-3">{exam.venue}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTimetable;