import React, { useState, useEffect } from "react";
import {
    updateDoc,
    doc,
    collection,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    writeBatch
} from "firebase/firestore";
import { db, auth } from "../../firebase";

// Color mappings (same as in ViewStudents)
const hallColors = {
    'NAS 1': 'border-sky-600',
    'NAS 2': 'border-emerald-500',
    'NAS 3': 'border-amber-700',
    'NAS 4': 'border-violet-600',
    'NAS 5': 'border-rose-500',
};

const departmentColors = {
    'computer science': 'bg-red-400',
    'ict': 'bg-emerald-400',
    'mathematics': 'bg-violet-400',
    'physics': 'bg-indigo-400',
    'chemistry': 'bg-pink-400',
    'biology': 'bg-green-400',
    'micro-biology': 'bg-blue-400',
    'electrical engineering': 'bg-orange-400',
    'mechanical engineering': 'bg-amber-400',
};

const SeatAssignmentModal = ({ registration, onClose, onSuccess }) => {
    const [halls, setHalls] = useState([]);
    const [selectedHall, setSelectedHall] = useState("");
    const [generatedSeat, setGeneratedSeat] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [currentHallConfig, setCurrentHallConfig] = useState(null);
    const [assignedSeats, setAssignedSeats] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [userRole, setUserRole] = useState(null);

    // Get current user's role on component mount
    useEffect(() => {
        const fetchUserRole = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "Users", auth.currentUser.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                }
            }
        };
        fetchUserRole();
    }, []);

    // Check and clear expired seats periodically
    useEffect(() => {
        const checkExpiredSeats = async () => {
            try {
                const now = new Date();
                const examEndThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 mins ago

                const q = query(
                    collection(db, "examRegistrations"),
                    where("seat", "!=", null),
                    where("examEndTime", "<=", examEndThreshold)
                );

                const snapshot = await getDocs(q);
                if (snapshot.empty) return;

                const batch = writeBatch(db);
                snapshot.forEach(doc => {
                    const ref = doc.ref;
                    batch.update(ref, {
                        seat: null,
                        examEndTime: null,
                        previousSeats: [...(doc.data().previousSeats || []), doc.data().seat]
                    });
                });

                await batch.commit();
                console.log(`Cleared ${snapshot.size} expired seats`);
            } catch (err) {
                console.error("Error clearing expired seats:", err);
            }
        };

        const interval = setInterval(checkExpiredSeats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch available exam halls
    useEffect(() => {
        const fetchHalls = async () => {
            try {
                setLoading(true);
                const querySnapshot = await getDocs(collection(db, "examHalls"));
                const hallData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    color: hallColors[doc.data().name] || 'border-gray-500' // Add color property
                }));
                setHalls(hallData);

                if (registration?.hall) {
                    setSelectedHall(registration.hall);
                    const hall = hallData.find(h => h.name === registration.hall);
                    if (hall) {
                        setCurrentHallConfig(hall);
                    }
                }
            } catch (err) {
                console.error("Error fetching halls:", err);
                setError("Failed to load exam halls. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchHalls();
    }, [registration]);

    // Fetch registrations and assigned seats when hall changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedHall) return;

            try {
                setLoading(true);
                setError("");

                const q = query(
                    collection(db, "examRegistrations"),
                    where("hall", "==", selectedHall),
                    where("status", "==", "approved")
                );
                const snapshot = await getDocs(q);

                const regs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    departmentColor: departmentColors[doc.data().department?.toLowerCase()] || 'bg-gray-200'
                }));
                setRegistrations(regs);

                const seats = regs.map(reg => reg.seat).filter(Boolean);
                setAssignedSeats(seats);

                const hall = halls.find(h => h.name === selectedHall);
                if (hall) {
                    setCurrentHallConfig(hall);
                } else {
                    setError("Selected hall configuration not found");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load seat data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedHall, halls]);

    useEffect(() => {
        setError("");
        setSuccessMessage("");
        setGeneratedSeat("");
    }, [selectedHall]);

    const getAdjacentSeats = (seatNumber, row) => {
        if (!currentHallConfig) return [];

        const adjacent = [];
        const seatsPerRow = currentHallConfig.seatsPerRow;
        const totalSeats = currentHallConfig.rows * seatsPerRow;

        if (row > 1) adjacent.push(seatNumber - seatsPerRow);
        if (row < currentHallConfig.rows) adjacent.push(seatNumber + seatsPerRow);
        if (seatNumber % seatsPerRow !== 1) adjacent.push(seatNumber - 1);
        if (seatNumber % seatsPerRow !== 0 && seatNumber < totalSeats) adjacent.push(seatNumber + 1);

        return adjacent;
    };

    const checkSeatConstraints = (seatNumber, row) => {
        const adjacentSeats = getAdjacentSeats(seatNumber, row);
        return !adjacentSeats.some(adjSeat =>
            registrations.some(r =>
                r.seat === adjSeat &&
                r.course === registration?.course &&
                r.department === registration?.department &&
                r.level === registration?.level
            )
        );
    };

    const findBestAvailableSeat = (availableSeats) => {
        const seatInfoMap = {};
        registrations.forEach(reg => {
            if (reg.seat) {
                seatInfoMap[reg.seat] = {
                    department: reg.department,
                    course: reg.course,
                    level: reg.level,
                    departmentColor: reg.departmentColor
                };
            }
        });

        let bestSeat = null;
        let maxDistance = -1;

        for (const seatNumber of availableSeats) {
            const row = Math.ceil(seatNumber / currentHallConfig.seatsPerRow);
            const col = (seatNumber - 1) % currentHallConfig.seatsPerRow + 1;

            if (!checkSeatConstraints(seatNumber, row)) {
                continue;
            }

            let minDistance = Infinity;

            for (const [s, info] of Object.entries(seatInfoMap)) {
                if (info.department === registration?.department) {
                    const seat = parseInt(s);
                    const sRow = Math.ceil(seat / currentHallConfig.seatsPerRow);
                    const sCol = (seat - 1) % currentHallConfig.seatsPerRow + 1;
                    const distance = Math.sqrt(Math.pow(row - sRow, 2) + Math.pow(col - sCol, 2));
                    if (distance < minDistance) minDistance = distance;
                }
            }

            if (minDistance === Infinity) {
                return { seatNumber, row, positionInRow: col };
            }

            if (minDistance > maxDistance) {
                maxDistance = minDistance;
                bestSeat = { seatNumber, row, positionInRow: col };
            }
        }

        return bestSeat || (availableSeats.length > 0 ? { seatNumber: availableSeats[0] } : null);
    };

    const generateSeatNumber = async () => {
        if (!selectedHall || !currentHallConfig) {
            setError("Please select a valid hall first");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const totalSeats = currentHallConfig.rows * currentHallConfig.seatsPerRow;
            const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
            const availableSeats = allSeats.filter(seat => !assignedSeats.includes(seat));

            if (availableSeats.length === 0) {
                setError("No available seats in this hall");
                return;
            }

            const selectedSeat = findBestAvailableSeat(availableSeats);

            if (!selectedSeat) {
                setError("No suitable seat found meeting all constraints");
                return;
            }

            setGeneratedSeat(selectedSeat.seatNumber);
            setSuccessMessage(`Assigned to Row ${selectedSeat.row}, Seat ${selectedSeat.positionInRow}`);
        } catch (err) {
            console.error("Seat generation failed:", err);
            setError("Failed to generate seat number. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const assignSeat = async () => {
        if (!selectedHall || !generatedSeat || !registration?.id) {
            setError("Please generate a valid seat first");
            return;
        }

        if (!auth.currentUser) {
            setError("User not authenticated");
            return;
        }

        if (!userRole || (userRole !== "admin" && userRole !== "courseAdviser")) {
            setError("You don't have permission to assign seats");
            return;
        }

        setLoading(true);
        setError("");

        try {
            let examEndTime = null;

            if (registration?.course) {
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const examQuery = query(
                        collection(db, "examSchedule"),
                        where("course", "==", registration.course),
                        where("date", "==", today)
                    );
                    const examSnapshot = await getDocs(examQuery);

                    if (!examSnapshot.empty) {
                        const examData = examSnapshot.docs[0].data();
                        if (examData?.endTime) {
                            const [hours, minutes] = examData.endTime.split(':');
                            examEndTime = new Date();
                            examEndTime.setHours(parseInt(hours));
                            examEndTime.setMinutes(parseInt(minutes));
                        }
                    }
                } catch (err) {
                    console.error("Error fetching exam schedule:", err);
                }
            }

            const updateData = {
                status: "approved",
                hall: selectedHall,
                seat: generatedSeat,
                approvedAt: serverTimestamp(),
                previousSeats: [...(registration.previousSeats || []), generatedSeat],
                approvedBy: auth.currentUser.uid,
                approverRole: userRole,
                departmentColor: departmentColors[registration.department?.toLowerCase()] || 'bg-gray-200',
                hallColor: hallColors[selectedHall] || 'border-gray-500'
            };

            if (examEndTime) {
                updateData.examEndTime = examEndTime;
            }

            await updateDoc(doc(db, "examRegistrations", registration.id), updateData);

            onSuccess?.(registration.id);
            onClose();
        } catch (err) {
            console.error("Assignment failed:", err);
            setError(`Failed to assign seat: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate seat when hall is selected
    useEffect(() => {
        if (selectedHall && currentHallConfig && !registration?.seat) {
            generateSeatNumber();
        }
    }, [selectedHall, currentHallConfig]);

    // Get department color for the current registration
    const getDepartmentColor = () => {
        return departmentColors[registration?.department?.toLowerCase()] || 'bg-gray-200';
    };

    // Get hall color for the selected hall
    const getHallColor = () => {
        return hallColors[selectedHall] || 'border-gray-500';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {registration?.hall ? "Edit Seat Assignment" : "Assign Seat"} for {registration?.studentName}
                </h2>

                <div className="space-y-4">
                    <div className={`p-3 rounded ${getDepartmentColor()} border-l-4 ${getHallColor()}`}>
                        <p className="text-gray-800"><span className="font-medium">Student ID:</span> {registration?.studentId}</p>
                        <p className="text-gray-800"><span className="font-medium">Department:</span>
                            <span className={`inline-flex items-center ml-1 px-2 py-0.5 rounded-full text-xs ${getDepartmentColor()}`}>
                                {registration?.department}
                            </span>
                        </p>
                        <p className="text-gray-800"><span className="font-medium">Course:</span> {registration?.course}</p>
                        <p className="text-gray-800"><span className="font-medium">Level:</span> {registration?.level}</p>
                        {registration?.hall && (
                            <p className="text-gray-800"><span className="font-medium">Current Hall:</span>
                                <span className={`inline-flex items-center ml-1 px-2 py-0.5 rounded-full text-xs border ${getHallColor()}`}>
                                    {registration.hall}
                                </span>
                            </p>
                        )}
                        {registration?.previousSeats?.length > 0 && (
                            <p className="text-gray-800"><span className="font-medium">Previous Seats:</span> {registration.previousSeats.join(', ')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Exam Hall</label>
                        <select
                            className={`border p-2 w-full rounded disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getHallColor().replace('border', 'focus:border')}`}
                            value={selectedHall}
                            onChange={(e) => setSelectedHall(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select Hall</option>
                            {halls.map((hall) => (
                                <option key={hall.id} value={hall.name}>
                                    {hall.name} ({hall.rows} rows × {hall.seatsPerRow} seats)
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedHall && currentHallConfig && (
                        <div className={`p-3 rounded border-l-4 ${getHallColor()} bg-blue-50`}>
                            <p className="font-medium text-gray-800">Hall Capacity:</p>
                            <div className="flex justify-between items-center mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${(assignedSeats.length / (currentHallConfig.rows * currentHallConfig.seatsPerRow)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-700">
                                    {assignedSeats.length} / {currentHallConfig.rows * currentHallConfig.seatsPerRow}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Available Seats:</span> {(currentHallConfig.rows * currentHallConfig.seatsPerRow) - assignedSeats.length}
                            </p>
                        </div>
                    )}

                    {generatedSeat && (
                        <div className={`p-3 rounded border-l-4 ${getHallColor()} ${getDepartmentColor()}`}>
                            <p className="font-medium text-gray-800">Generated Seat Assignment</p>
                            <div className="mt-2 flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${getDepartmentColor()}`}></div>
                                <span className="font-semibold">Seat Number: {generatedSeat}</span>
                            </div>
                            {successMessage && (
                                <p className="mt-1 text-sm text-gray-700">{successMessage}</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded border-l-4 border-red-500">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`px-4 py-2 rounded text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${loading ? 'bg-green-400' : 'bg-green-500'}`}
                            onClick={assignSeat}
                            disabled={loading || !generatedSeat}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                registration?.hall ? "Update Assignment" : "Confirm Assignment"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatAssignmentModal;