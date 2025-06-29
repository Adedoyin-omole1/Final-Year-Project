import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../Components/Sidebar/Sidebar';
import TopNavbar from '../../Components/Navbar/TopNavbar';
import { FiCalendar, FiClock, FiBook, FiUser, FiMapPin, FiTrash2, FiEdit, FiPrinter, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ViewTimetable = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeStr) => {
        if (timeStr.includes('Morning')) return '9:00 AM - 12:00 PM';
        if (timeStr.includes('Afternoon')) return '2:00 PM - 5:00 PM';
        return timeStr;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this timetable?')) {
            try {
                await deleteDoc(doc(db, 'examTimetables', id));
                setTimetables(timetables.filter(timetable => timetable.id !== id));
                toast.success('Timetable deleted successfully');
            } catch (error) {
                console.error("Error deleting timetable:", error);
                toast.error("Failed to delete timetable");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit-timetable/${id}`);
    };

    const handlePrint = (timetableId) => {
        const printContent = document.getElementById(`timetable-${timetableId}`).innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = `
            <div class="p-6">
                <h1 class="text-2xl font-bold mb-4">Examination Timetable</h1>
                ${printContent}
            </div>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const q = query(collection(db, 'examTimetables'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const timetablesData = [];
                querySnapshot.forEach((doc) => {
                    timetablesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort exams by date and time
                timetablesData.forEach(timetable => {
                    timetable.exams.sort((a, b) => {
                        const dateCompare = new Date(a.date) - new Date(b.date);
                        if (dateCompare !== 0) return dateCompare;
                        return a.time.includes('Morning') ? -1 : 1;
                    });
                });

                setTimetables(timetablesData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching timetables:", error);
                toast.error("Failed to load timetables");
                setLoading(false);
            }
        };

        fetchTimetables();
    }, []);

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Examination Timetable</h1>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : timetables.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl shadow text-center">
                                <p className="text-gray-500">No exam timetables found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {timetables.map((timetable) => (
                                    <div key={timetable.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100" id={`timetable-${timetable.id}`}>
                                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                                            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                                                {timetable.status === 'Draft' && (
                                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mr-3 font-medium">
                                                        DRAFT
                                                    </span>
                                                )}
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    Examination Schedule
                                                </span>
                                            </h2>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {timetable.exams.length} exams scheduled
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handlePrint(timetable.id)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                                                        title="Print"
                                                    >
                                                        <FiPrinter className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(timetable.id)}
                                                        className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(timetable.id)}
                                                        className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Group exams by date */}
                                        {Array.from(new Set(timetable.exams.map(exam => exam.date))).map(date => (
                                            <div key={date} className="border-b last:border-b-0">
                                                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100">
                                                    <h3 className="font-medium text-blue-800 flex items-center">
                                                        <FiCalendar className="mr-3 text-blue-600" />
                                                        <span className="font-semibold">{getDayName(date)}</span>
                                                        <span className="mx-2 text-blue-400">•</span>
                                                        <span>{formatDate(date)}</span>
                                                    </h3>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="text-left text-sm text-gray-600 bg-gray-50">
                                                                <th className="px-6 py-3 font-medium border-b border-gray-200">DATE/TIME</th>
                                                                <th className="px-6 py-3 font-medium border-b border-gray-200">MORNING (9.00 A.M - 12.00 NOON)</th>
                                                                <th className="px-6 py-3 font-medium border-b border-gray-200">AFTERNOON (2.00 P.M. - 5.00 P.M.)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 border-r border-gray-100 align-top">
                                                                    <div className="font-medium text-gray-700">{getDayName(date)}</div>
                                                                    <div className="text-sm text-gray-500 mt-1">{formatDate(date)}</div>
                                                                </td>
                                                                <td className="px-6 py-4 border-r border-gray-100 align-top">
                                                                    <div className="grid gap-3">
                                                                        {timetable.exams
                                                                            .filter(exam => exam.date === date && exam.time.includes('Morning'))
                                                                            .map((exam, index) => (
                                                                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                                    <div className="font-medium text-gray-800 flex items-center">
                                                                                        <FiBook className="mr-2 text-blue-500 min-w-[20px]" />
                                                                                        <span className="truncate">{exam.courseCode}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                                                                        <FiMapPin className="mr-2 text-green-500 min-w-[20px]" />
                                                                                        <span>{exam.venue}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                                        <FiUsers className="mr-2 text-purple-500 min-w-[20px]" />
                                                                                        <span>Students: {exam.studentCount || 'N/A'}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                                        <FiUser className="mr-2 text-orange-500 min-w-[20px]" />
                                                                                        <span>Lecturer: {exam.lecturer || 'Not assigned'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 align-top">
                                                                    <div className="grid gap-3">
                                                                        {timetable.exams
                                                                            .filter(exam => exam.date === date && exam.time.includes('Afternoon'))
                                                                            .map((exam, index) => (
                                                                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                                    <div className="font-medium text-gray-800 flex items-center">
                                                                                        <FiBook className="mr-2 text-blue-500 min-w-[20px]" />
                                                                                        <span className="truncate">{exam.courseCode}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                                                                        <FiMapPin className="mr-2 text-green-500 min-w-[20px]" />
                                                                                        <span>{exam.venue}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                                        <FiUsers className="mr-2 text-purple-500 min-w-[20px]" />
                                                                                        <span>Students: {exam.studentCount || 'N/A'}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                                        <FiUser className="mr-2 text-orange-500 min-w-[20px]" />
                                                                                        <span>Lecturer: {exam.lecturer || 'Not assigned'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ViewTimetable;