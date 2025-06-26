import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Sidebar from '../../Components/Sidebar/Sidebar';
import TopNavbar from '../../Components/Navbar/TopNavbar';
import { FiCalendar, FiClock, FiBook, FiUser, FiMapPin, FiTrash2, FiEdit, FiPrinter } from 'react-icons/fi';
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
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (timeStr.includes('Morning')) return '9:00 AM - 11:00 AM';
        if (timeStr.includes('Afternoon')) return '1:00 PM - 3:00 PM';
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
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Examination Timetable</h1>
                            <div className="text-sm text-gray-500">
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : timetables.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow text-center">
                                <p className="text-gray-500">No exam timetables found</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {timetables.map((timetable) => (
                                    <div key={timetable.id} className="bg-white rounded-lg shadow overflow-hidden" id={`timetable-${timetable.id}`}>
                                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                                            <h2 className="text-lg font-semibold text-gray-700">
                                                {timetable.status === 'Draft' && (
                                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-2">
                                                        DRAFT
                                                    </span>
                                                )}
                                                Examination Schedule
                                            </h2>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-sm text-gray-500">
                                                    {timetable.exams.length} exams scheduled
                                                </div>
                                                <button
                                                    onClick={() => handlePrint(timetable.id)}
                                                    className="text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Print"
                                                >
                                                    <FiPrinter className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(timetable.id)}
                                                    className="text-gray-500 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(timetable.id)}
                                                    className="text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Group exams by date */}
                                        {Array.from(new Set(timetable.exams.map(exam => exam.date))).map(date => (
                                            <div key={date} className="border-b last:border-b-0">
                                                <div className="px-6 py-3 bg-blue-50">
                                                    <h3 className="font-medium text-blue-800 flex items-center">
                                                        <FiCalendar className="mr-2" />
                                                        {getDayName(date)} • {formatDate(date)}
                                                    </h3>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="text-left text-sm text-gray-600 border-b">
                                                                <th className="px-6 py-3 font-medium">Course</th>
                                                                <th className="px-6 py-3 font-medium">Time</th>
                                                                <th className="px-6 py-3 font-medium">Venue</th>
                                                                <th className="px-6 py-3 font-medium">Lecturer</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {timetable.exams
                                                                .filter(exam => exam.date === date)
                                                                .map((exam, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <div className="font-medium text-gray-900">
                                                                                {exam.courseCode}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {exam.courseTitle}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <FiClock className="mr-2 text-gray-400" />
                                                                                <span className="font-medium">
                                                                                    {formatTime(exam.time)}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center">
                                                                                <FiMapPin className="mr-2 text-gray-400" />
                                                                                {exam.venue}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center">
                                                                                <FiUser className="mr-2 text-gray-400" />
                                                                                {exam.invigilator || (
                                                                                    <span className="text-gray-400">Not assigned</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
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