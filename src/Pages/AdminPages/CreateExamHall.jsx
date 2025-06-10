import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import Sidebar from "../../Components/Sidebar/sidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateExamHall = () => {
    const [name, setName] = useState("");
    const [rows, setRows] = useState("");
    const [seatsPerRow, setSeatsPerRow] = useState("");
    const [totalStudents, setTotalStudents] = useState("");
    const [loading, setLoading] = useState(false);

    const checkAdmin = async (userId) => {
        if (!userId) return false;
        const userRef = doc(db, "Users", userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() && userSnap.data().role === "admin";
    };

    const fetchAssignedSeats = async (hallName) => {
        const q = query(
            collection(db, "examRegistrations"),
            where("hall", "==", hallName),
            where("status", "==", "approved")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => doc.data().seat);
    };

    const handleCreateHall = async () => {
        if (!name || !rows || !seatsPerRow || !totalStudents) {
            toast.error("Please fill all fields");
            return;
        }

        if (parseInt(rows) <= 0 || parseInt(seatsPerRow) <= 0 || parseInt(totalStudents) <= 0) {
            toast.error("Rows, seats, and total students must be greater than zero");
            return;
        }

        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const isAdmin = await checkAdmin(user.uid);
            if (!isAdmin) {
                throw new Error("Permission denied: Only admins can create exam halls");
            }

            const assignedSeats = await fetchAssignedSeats(name);
            const totalSeats = parseInt(rows) * parseInt(seatsPerRow);

            await addDoc(collection(db, "examHalls"), {
                name,
                rows: parseInt(rows),
                seatsPerRow: parseInt(seatsPerRow),
                totalSeats,
                totalStudents: parseInt(totalStudents),
                assignedSeats,
                createdBy: user.uid,
                timestamp: new Date(),
            });

            toast.success("Exam hall created successfully");
            setName("");
            setRows("");
            setSeatsPerRow("");
            setTotalStudents("");
        } catch (err) {
            toast.error(err.message || "Failed to create exam hall. Please try again.");
            console.error("Error adding hall:", err);
        }

        setLoading(false);
    };

    return (
        <div className="w-full flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col items-center justify-center w-full">
                <div className="max-w-lg w-full p-8 bg-white shadow-lg rounded-xl">
                    <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
                        Create Exam Hall
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600">Hall Name</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600">Number of Rows</label>
                        <input
                            type="number"
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={rows}
                            onChange={(e) => setRows(e.target.value)}
                            min="1"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600">Seats Per Row</label>
                        <input
                            type="number"
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={seatsPerRow}
                            onChange={(e) => setSeatsPerRow(e.target.value)}
                            min="1"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600">Total Number of Students</label>
                        <input
                            type="number"
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={totalStudents}
                            onChange={(e) => setTotalStudents(e.target.value)}
                            min="1"
                        />
                    </div>

                    <button
                        className={`w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 ${loading && "opacity-50 cursor-not-allowed"
                            }`}
                        onClick={handleCreateHall}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 0116 0h-2a6 6 0 10-12 0H4z"
                                    ></path>
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            "Create Exam Hall"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateExamHall;