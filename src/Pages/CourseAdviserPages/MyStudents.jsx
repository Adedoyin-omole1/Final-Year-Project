import { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiBook, FiUsers } from 'react-icons/fi';
import CourseAdviserSidebar from '../../Components/Sidebar/CourseAdviserSidebar';
import TopNavbar from '../../Components/Navbar/TopNavbar';

const MyStudentsCourses = () => {
    // Sample data structure
    const coursesByLevelAndDept = {
        '100 Level': {
            'Computer Science': [
                'Introduction to Programming',
                'Discrete Mathematics',
                'Computer Fundamentals'
            ],
            'ICT': [
                'Introduction to ICT',
                'Basic Electronics',
                'Communication Skills'
            ],
            'Micro-Biology': [
                'General Microbiology',
                'Cell Biology',
                'Biochemistry'
            ],
            'Geology': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ],
            'Industral-Chemistry': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ]
        },
        '200 Level': {
            'Computer Science': [
                'Data Structures',
                'Computer Architecture',
                'Digital Logic Design'
            ],
            'ICT': [
                'Database Systems',
                'Web Technologies',
                'System Analysis'
            ],
            'Micro-Biology': [
                'Microbial Physiology',
                'Immunology',
                'Genetics'
            ],
            'Geology': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ],
            'Industral-Chemistry': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ]
        },
        '300 Level': {
            'Computer Science': [
                'Operating Systems',
                'Software Engineering',
                'Computer Networks'
            ],
            'ICT': [
                'Information Security',
                'Cloud Computing',
                'Mobile App Development'
            ],
            'Micro-Biology': [
                'Medical Microbiology',
                'Virology',
                'Food Microbiology'
            ],
            'Geology': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ],
            'Industral-Chemistry': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ]
        },
        '400 Level': {
            'Computer Science': [
                'Artificial Intelligence',
                'Machine Learning',
                'Project Work'
            ],
            'ICT': [
                'Big Data Analytics',
                'IoT Systems',
                'Final Year Project'
            ],
            'Micro-Biology': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ],
            'Geology': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ],
            'Industral-Chemistry': [
                'Industrial Microbiology',
                'Research Methods',
                'Project Work'
            ]
        }
    };

    const [selectedLevel, setSelectedLevel] = useState('');
    const [expandedDepts, setExpandedDepts] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleDepartment = (dept) => {
        setExpandedDepts(prev => ({
            ...prev,
            [dept]: !prev[dept]
        }));
    };

    return (
        <div className="w-full flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <CourseAdviserSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation Bar */}
                <TopNavbar setSidebarOpen={setSidebarOpen} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Students Courses</h2>

                        {/* Level Selection Dropdown */}
                        <div className="mb-6">
                            <label htmlFor="level-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Academic Level
                            </label>
                            <select
                                id="level-select"
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                            >
                                <option value="">-- Select Level --</option>
                                {Object.keys(coursesByLevelAndDept).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Courses Display */}
                        {selectedLevel && (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <h3 className="bg-gray-100 px-4 py-3 font-medium text-gray-800 flex items-center">
                                    <FiUsers className="mr-2" />
                                    {selectedLevel} Courses
                                </h3>

                                <div className="divide-y divide-gray-200">
                                    {Object.keys(coursesByLevelAndDept[selectedLevel]).map(dept => (
                                        <div key={dept} className="px-4">
                                            <button
                                                onClick={() => toggleDepartment(dept)}
                                                className="w-full flex justify-between items-center py-3 text-left font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                                            >
                                                <div className="flex items-center">
                                                    <FiBook className="mr-2 text-blue-500" />
                                                    {dept}
                                                </div>
                                                {expandedDepts[dept] ? (
                                                    <FiChevronDown className="h-5 w-5" />
                                                ) : (
                                                    <FiChevronRight className="h-5 w-5" />
                                                )}
                                            </button>

                                            {expandedDepts[dept] && (
                                                <ul className="pl-8 pb-3 space-y-2">
                                                    {coursesByLevelAndDept[selectedLevel][dept].map((course, index) => (
                                                        <li key={index} className="text-sm text-gray-600 hover:text-gray-900">
                                                            {course}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!selectedLevel && (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No level selected</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Please select an academic level to view courses
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyStudentsCourses;