import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const StudentInfoForm = ({ formData, handleChange, nextStep, updateCourses }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    // Fetch courses from Firebase
    useEffect(() => {
        const fetchCourses = async () => {
            if (formData.department && formData.level) {
                console.log("Fetching courses for:", formData.department, formData.level);

                const q = query(
                    collection(db, "courses"),
                    where("department", "==", formData.department),
                    where("level", "==", formData.level)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const courseData = querySnapshot.docs[0].data().courses || [];
                    console.log("Fetched Courses:", courseData);
                    setCourses(courseData);
                } else {
                    console.log("No courses found for this department and level.");
                }
            }
        };
        fetchCourses();
    }, [formData.department, formData.level]);

    // Handle course selection (limit to 12)
    const handleCourseSelection = (course) => {
        if (selectedCourses.includes(course)) {
            setSelectedCourses(selectedCourses.filter((c) => c !== course));
        } else if (selectedCourses.length < 12) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (selectedCourses.length === 0) {
            alert("Please select at least one course.");
            return;
        }
        updateCourses(selectedCourses);
        nextStep();
    };

    return (
        <form onSubmit={handleNext} className="bg-white p-8 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Student Information</h2>

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-3 border rounded-lg" />
            <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} placeholder="Matric Number" required className="w-full p-3 border rounded-lg" />

            <h3 className="text-lg font-semibold">Select Courses (Max: 12)</h3>

            {courses.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {courses.map((course) => (
                        <label key={course} className="flex items-center">
                            <input type="checkbox" value={course} checked={selectedCourses.includes(course)} onChange={() => handleCourseSelection(course)} />
                            <span className="ml-2">{course}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="text-red-500">No courses found for this department and level.</p>
            )}

            <button type="submit" className="mt-6 bg-blue-600 text-white py-2 w-full rounded-lg">Next</button>
        </form>
    );
};

export default StudentInfoForm;
