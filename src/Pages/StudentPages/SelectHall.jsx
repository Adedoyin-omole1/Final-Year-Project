import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import StudentSidebar from "../../Components/Sidebar/StudentSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SelectHall = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        matricNumber: "",
        department: "",
        level: "",
        courses: [],
        status: "pending"
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const departmentCourses = {
        "Computer Science": [
            "CSC 101 - Introduction to Computing",
            "CSC 102 - Fundamentals of Programming",
            "MTH 101 - Mathematics for Computing",
            "PHY 101 - Physics for Computer Science",
            "CSC 201 - Data Structures",
            "CSC 202 - Object-Oriented Programming",
            "CSC 203 - Database Management",
            "CSC 204 - Operating Systems",
            "CSC 301 - Computer Networks",
            "CSC 302 - Software Engineering",
            "CSC 303 - Cybersecurity",
            "CSC 304 - Artificial Intelligence",
            "CSC 404 - Artificial Intelligence II",
        ],
        "ICT": [
            "ICT 101 - Circuit Theory I",
            "ICT 102 - Digital Electronics",
            "ICT 201 - Electrical Machines",
            "ICT 202 - Power Systems",
            "ICT 301 - Control Systems",
            "ICT 302 - Power Electronics",
            "ICT 303 - Microprocessors & Embedded Systems",
            "ICT 304 - High Voltage Engineering",
            "ICT 401 - Renewable Energy Systems",
            "ICT 402 - Industrial Automation"
        ],
        "Industral Chemistry": [
            "ICH 101 - Principles of Management",
            "ICH 102 - Business Communication",
            "ICH 201 - Organizational Behavior",
            "ICH 202 - Business Law",
            "ICH 301 - Entrepreneurship Development",
            "ICH 302 - Business Finance",
            "ICH 303 - Corporate Governance",
            "ICH 304 - Strategic Management",
            "ICH 401 - International Business",
            "ICH 402 - E-commerce & Digital Marketing"
        ],
        "Micro- Biology": [
            "MCB 101 - Introduction to Biology",
            "MCB 102 - Introduction of In-Orgainc chemisty",
            "MCB 203 - Basic Techniques In MiroBiology",
            "MCB 201 - Genral Micro-Biology",
            "MCB 322 - Bio-deturation",
            "MCB 324 - Medical Viorology",
            "MCB 320 - Food Miro-Biology",
            "MCB 314 - Plant Pantology",
            "MCB 401 - Organic Chemistry",
            "MCB 402 - Biologycal tearms"
        ],
        "Physics And Electronics": [
            "PHY 101 - Introduction to Biology",
            "PHY 102 - Introduction of In-Orgainc chemisty",
            "PHY 203 - Basic Techniques In MiroBiology",
            "PHY 201 - Genral Micro-Biology",
            "PHY 322 - Bio-deturation",
            "PHY 324 - Medical Viorology",
            "PHY 320 - Food Miro-Biology",
            "PHY 314 - Plant Pantology",
            "PHY 401 - Organic Chemistry",
            "PHY 402 - Biologycal tearms"
        ]

    };

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                // Pre-fill the form with user's email if available
                setFormData(prev => ({
                    ...prev,
                    email: user.email // Add email to form data
                }));
            } else {
                navigate("/login");
            }
        });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCourseChange = (course) => {
        setFormData((prev) => {
            const selectedCourses = prev.courses.includes(course)
                ? prev.courses.filter((c) => c !== course)
                : [...prev.courses, course];

            if (selectedCourses.length > 12) {
                toast.error("You can only select up to 12 courses.");
                return prev;
            }

            return { ...prev, courses: selectedCourses };
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.matricNumber || !formData.department || !formData.level || formData.courses.length === 0) {
            toast.error("Please fill in all fields and select at least one course.");
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, "examRegistrations"), {
                ...formData,
                userId: user.uid,
                email: user.email, // Include user's email
                timestamp: new Date(),
            });

            toast.success("Exam registration successful!");
            setTimeout(() => {
                navigate("/student");
            }, 2000);
        } catch (error) {
            console.error("Error saving registration:", error);
            toast.error("Failed to save registration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            <StudentSidebar />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                    <ToastContainer position="top-right" autoClose={3000} />

                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Registration</h1>
                            <p className="text-gray-600">Fill in your details and select your courses for the examination</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                                        <input
                                            type="text"
                                            name="matricNumber"
                                            value={formData.matricNumber}
                                            onChange={handleChange}
                                            placeholder="Enter your matric number"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Select your department</option>
                                            {Object.keys(departmentCourses).map((dept) => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                        <input
                                            type="text"
                                            name="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            placeholder="e.g., 100, 200, 300, 400"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {formData.department && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-sm font-medium text-gray-700">Select Courses</label>
                                            <span className="text-sm text-gray-500">
                                                Selected: {formData.courses.length}/12 courses
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                                            {departmentCourses[formData.department]?.map((course) => (
                                                <div key={course} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={course}
                                                        checked={formData.courses.includes(course)}
                                                        onChange={() => handleCourseChange(course)}
                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={course} className="ml-2 text-sm text-gray-700">
                                                        {course}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`px-6 py-2 rounded-lg font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-all flex items-center`}
                                >
                                    {loading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {loading ? "Processing..." : "Submit Registration"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectHall;