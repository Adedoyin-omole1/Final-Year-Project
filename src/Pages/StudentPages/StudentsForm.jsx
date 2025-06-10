import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentsForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        matricNumber: "",
        department: "",
        level: "",
        exam: "",
        hall: "",
        seat: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            toast.error("You must be logged in to submit the form.");
            return;
        }

        // Disable the submit button to prevent multiple submissions
        e.target.disabled = true;

        try {
            // Add form data to Firestore
            const docRef = await addDoc(collection(db, "seatAllocations"), {
                ...formData,
                userId: user.uid, // Add the user ID to the document
            });
            console.log("Document written with ID: ", docRef.id);

            // Save to localStorage (optional)
            localStorage.setItem("examSelection", JSON.stringify(formData));

            // Show success message
            toast.success("Form submitted successfully!");

            // Reset the form (optional)
            setFormData({
                name: "",
                matricNumber: "",
                department: "",
                level: "",
                exam: "",
                hall: "",
                seat: "",
            });

            // Redirect to the first form or another page after a short delay
            setTimeout(() => {
                navigate("/student/select-halls"); // Redirect to the first form
            }, 2000);
        } catch (error) {
            console.error("Error adding document: ", error);
            toast.error("Failed to submit form. Please try again.");
        } finally {
            // Re-enable the submit button
            e.target.disabled = false;
        }
    };

    const renderStep1 = () => {
        return (
            <div className="p-6 max-w-2xl w-full">
                <form onSubmit={nextStep} className="bg-white p-8 shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">Student Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Matric Number</label>
                            <input
                                type="text"
                                name="matricNumber"
                                value={formData.matricNumber}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level</label>
                            <input
                                type="text"
                                name="level"
                                value={formData.level}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Exam</label>
                            <select
                                name="exam"
                                value={formData.exam}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Exam --</option>
                                <option value="CSC 401">CSC 401</option>
                                <option value="MTH 402">MTH 402</option>
                                <option value="PHY 301">PHY 301</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const renderStep2 = () => {
        return (
            <div className="p-6 max-w-2xl w-full">
                <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">Select Hall and Seat</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Hall</label>
                            <select
                                name="hall"
                                value={formData.hall}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Hall --</option>
                                <option value="Hall A">Hall A</option>
                                <option value="Hall B">Hall B</option>
                                <option value="Hall C">Hall C</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Seat</label>
                            <select
                                name="seat"
                                value={formData.seat}
                                required
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Seat --</option>
                                <option value="Seat 1">Seat 1</option>
                                <option value="Seat 2">Seat 2</option>
                                <option value="Seat 3">Seat 3</option>
                            </select>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <ToastContainer />
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </div>
    );
};

export default StudentsForm;