import React, { useState } from 'react';
import {
    FiCalendar, FiClock, FiUsers, FiBook,
    FiPlus, FiMinus, FiMonitor, FiEdit,
    FiArrowRight, FiCheck, FiUser, FiX
} from 'react-icons/fi';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import TopNavbar from '../../Components/Navbar/TopNavbar';

const MAX_SEATS = {
    WRITTEN: 210,
    CBT: 80
};

const ExamScheduling = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [studentCount, setStudentCount] = useState(0);
    const [examType, setExamType] = useState('Written');
    const [venue, setVenue] = useState('');
    const [examDate, setExamDate] = useState('');
    const [examTime, setExamTime] = useState('Morning');
    const [invigilators, setInvigilators] = useState([]);
    const [currentInvigilator, setCurrentInvigilator] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [remainingSeats, setRemainingSeats] = useState(MAX_SEATS.WRITTEN);

    const levels = ['100 Level', '200 Level', '300 Level', '400 Level'];
    const departments = ['Computer Science', 'ICT', 'Industrial Chemistry', 'Micro-Biology', 'Physics'];
    const times = ['Morning (9:00 AM)', 'Afternoon (2:00 PM)'];
    const examTypes = ['Written', 'CBT'];

    const handleExamTypeChange = (type) => {
        setExamType(type);
        setRemainingSeats(type === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN);
        toast.info(`Exam type changed to ${type}. Max seats: ${type === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN}`);
    };

    const handleAddCourse = () => {
        if (!courseCode || !courseTitle || studentCount <= 0) {
            toast.error("Please fill all course details and enter student count");
            return;
        }

        if (!selectedLevel || !selectedDepartment) {
            toast.error("Please select level and department");
            return;
        }

        if (examType === 'CBT' && !venue) {
            toast.error("Please specify venue for CBT exam");
            return;
        }

        setCurrentStep(2);
        toast.success("Course details saved! Now schedule the exam.");
    };

    const handleAddInvigilator = () => {
        if (!currentInvigilator.trim()) {
            toast.error("Please enter an invigilator name");
            return;
        }

        if (invigilators.length >= 20) {
            toast.error("Maximum of 20 invigilators reached");
            return;
        }

        if (invigilators.includes(currentInvigilator)) {
            toast.error("This invigilator is already added");
            return;
        }

        setInvigilators([...invigilators, currentInvigilator]);
        setCurrentInvigilator('');
    };

    const handleRemoveInvigilator = (index) => {
        const updatedInvigilators = [...invigilators];
        updatedInvigilators.splice(index, 1);
        setInvigilators(updatedInvigilators);
    };

    const handleScheduleExam = () => {
        if (!examDate) {
            toast.error("Please select an exam date");
            return;
        }

        if (invigilators.length === 0) {
            toast.error("Please add at least one invigilator");
            return;
        }

        const maxSeats = examType === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN;
        const currentSessionStudents = timetable
            .filter(exam => exam.date === examDate && exam.time === examTime && exam.type === examType)
            .reduce((sum, exam) => sum + exam.studentCount, 0);

        const availableSeats = maxSeats - currentSessionStudents;

        if (studentCount > availableSeats) {
            toast.error(`Only ${availableSeats} seats remaining for ${examType} exams in this session`);
            return;
        }

        const newExam = {
            level: selectedLevel,
            department: selectedDepartment,
            courseCode,
            courseTitle,
            studentCount,
            date: examDate,
            time: examTime,
            type: examType,
            invigilators,
            venue: examType === 'CBT' ? venue : 'NAS 1 - NAS 5'
        };

        setTimetable([...timetable, newExam]);
        setRemainingSeats(availableSeats - studentCount);
        setInvigilators([]);

        setCourseCode('');
        setCourseTitle('');
        setStudentCount(0);
        setVenue('');
        setCurrentStep(1);
        toast.success(`Exam scheduled for ${examDate} (${examTime})! Add another course or finalize timetable.`);
    };

    const handleRemoveExam = (index) => {
        const updatedTimetable = [...timetable];
        const removedExam = updatedTimetable.splice(index, 1)[0];
        setTimetable(updatedTimetable);

        const maxSeats = removedExam.type === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN;
        const currentSessionStudents = updatedTimetable
            .filter(exam => exam.date === removedExam.date && exam.time === removedExam.time && exam.type === removedExam.type)
            .reduce((sum, exam) => sum + exam.studentCount, 0);

        setRemainingSeats(maxSeats - currentSessionStudents);
        toast.warning(`Removed ${removedExam.courseCode} from timetable`);
    };

    const handleFinalizeTimetable = async () => {
        if (timetable.length === 0) {
            toast.error("No exams scheduled in the timetable");
            return;
        }

        try {
            const loadingToast = toast.loading("Creating exam timetable...");

            await addDoc(collection(db, 'examTimetables'), {
                createdAt: new Date(),
                exams: timetable,
                totalStudents: timetable.reduce((sum, exam) => sum + exam.studentCount, 0),
                status: 'Draft'
            });

            toast.update(loadingToast, {
                render: "Exam timetable created successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            setTimetable([]);
            setRemainingSeats(MAX_SEATS.WRITTEN);
            setCurrentStep(1);
        } catch (error) {
            console.error("Error creating timetable:", error);
            toast.error("Failed to create timetable. Please try again.");
        }
    };

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Scheduling System</h1>

                        {/* Progress indicator */}
                        <div className="flex mb-8">
                            <div className={`flex-1 text-center border-b-2 ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
                                <div className={`inline-block rounded-full w-8 h-8 ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    1
                                </div>
                                <p className="mt-2">Course Details</p>
                            </div>
                            <div className={`flex-1 text-center border-b-2 ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-300'}`}>
                                <div className={`inline-block rounded-full w-8 h-8 ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    2
                                </div>
                                <p className="mt-2">Schedule Exam</p>
                            </div>
                            <div className={`flex-1 text-center border-b-2 ${currentStep >= 3 ? 'border-blue-600' : 'border-gray-300'}`}>
                                <div className={`inline-block rounded-full w-8 h-8 ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                    3
                                </div>
                                <p className="mt-2">Timetable</p>
                            </div>
                        </div>

                        {/* Step 1: Course Details */}
                        {currentStep === 1 && (
                            <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FiBook className="mr-2" /> Course Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Level</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={selectedLevel}
                                            onChange={(e) => setSelectedLevel(e.target.value)}
                                        >
                                            <option value="">Select Level</option>
                                            {levels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Department</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Course Code</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        placeholder="Enter course code (e.g., CSC 101)"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Course Title</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        placeholder="Enter course title"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Student Count</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={studentCount}
                                            onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Exam Type</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={examType}
                                            onChange={(e) => handleExamTypeChange(e.target.value)}
                                        >
                                            {examTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {examType === 'CBT' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-1">CBT Venue</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            placeholder="Enter computer lab/venue"
                                            value={venue}
                                            onChange={(e) => setVenue(e.target.value)}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleAddCourse}
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                                >
                                    Next: Schedule Exam <FiArrowRight className="ml-2" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Schedule Exam */}
                        {currentStep === 2 && (
                            <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FiCalendar className="mr-2" /> Schedule Exam
                                </h2>

                                <div className="mb-4">
                                    <p className="font-medium mb-2">Course: {courseCode} - {courseTitle}</p>
                                    <p className="text-sm text-gray-600">{selectedLevel}, {selectedDepartment}</p>
                                    <p className="text-sm text-gray-600">
                                        {studentCount} students | {examType} exam (Max: {examType === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN})
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Exam Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">Session Time</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={examTime}
                                            onChange={(e) => setExamTime(e.target.value)}
                                        >
                                            {times.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-1">Invigilators ({invigilators.length}/20)</label>
                                    <div className="flex mb-2">
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border rounded-l"
                                            placeholder="Enter invigilator name"
                                            value={currentInvigilator}
                                            onChange={(e) => setCurrentInvigilator(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddInvigilator()}
                                        />
                                        <button
                                            onClick={handleAddInvigilator}
                                            className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>

                                    {invigilators.length > 0 && (
                                        <div className="border rounded p-2 max-h-40 overflow-y-auto">
                                            {invigilators.map((invigilator, index) => (
                                                <div key={index} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50">
                                                    <span className="flex items-center">
                                                        <FiUser className="mr-2 text-gray-500" />
                                                        {invigilator}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveInvigilator(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleScheduleExam}
                                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center"
                                    >
                                        Add to Timetable <FiPlus className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Timetable Review */}
                        {currentStep === 3 && (
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FiUsers className="mr-2" /> Exam Timetable
                                </h2>

                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="font-medium">
                                        Remaining Seats: {remainingSeats} / {examType === 'CBT' ? MAX_SEATS.CBT : MAX_SEATS.WRITTEN}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        (Max {MAX_SEATS.CBT} for CBT, {MAX_SEATS.WRITTEN} for Written exams)
                                    </p>
                                </div>

                                {timetable.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">
                                        No exams scheduled yet. Add your first course to begin.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="p-3 text-left">Date</th>
                                                    <th className="p-3 text-left">Time</th>
                                                    <th className="p-3 text-left">Course</th>
                                                    <th className="p-3 text-left">Title</th>
                                                    <th className="p-3 text-left">Type</th>
                                                    <th className="p-3 text-left">Students</th>
                                                    <th className="p-3 text-left">Venue</th>
                                                    <th className="p-3 text-left">Invigilators</th>
                                                    <th className="p-3 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {timetable.map((exam, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="p-3">{exam.date}</td>
                                                        <td className="p-3">{exam.time}</td>
                                                        <td className="p-3 font-medium">{exam.courseCode}</td>
                                                        <td className="p-3">{exam.courseTitle}</td>
                                                        <td className="p-3 flex items-center">
                                                            {exam.type === 'CBT' ? (
                                                                <FiMonitor className="mr-1 text-blue-600" />
                                                            ) : (
                                                                <FiEdit className="mr-1 text-green-600" />
                                                            )}
                                                            {exam.type}
                                                        </td>
                                                        <td className="p-3">{exam.studentCount}</td>
                                                        <td className="p-3">{exam.venue}</td>
                                                        <td className="p-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {exam.invigilators.map((inv, i) => (
                                                                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                                                                        <FiUser className="mr-1" /> {inv}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <button
                                                                onClick={() => handleRemoveExam(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Remove exam"
                                                            >
                                                                <FiMinus />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center"
                                    >
                                        <FiPlus className="mr-2" /> Add Another Course
                                    </button>
                                    <button
                                        onClick={handleFinalizeTimetable}
                                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center"
                                        disabled={timetable.length === 0}
                                    >
                                        Finalize Timetable <FiCheck className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Navigation to view timetable */}
                        {currentStep !== 3 && timetable.length > 0 && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                                >
                                    View Current Timetable ({timetable.length} exams scheduled)
                                    <FiArrowRight className="ml-2" />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExamScheduling;