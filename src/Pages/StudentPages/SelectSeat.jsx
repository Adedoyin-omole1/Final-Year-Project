// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../../firebase";
// import { collection, getDocs, addDoc, query, where, doc } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import StudentSidebar from "../../Components/Sidebar/StudentSidebar";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const SelectSeat = () => {
//     const navigate = useNavigate();
//     const [seats, setSeats] = useState([]);
//     const [selectedSeat, setSelectedSeat] = useState("");
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const hallId = localStorage.getItem("selectedHall");
//     const department = localStorage.getItem("department");

//     useEffect(() => {
//         console.log("LocalStorage - Hall ID:", hallId, "Department:", department);
//         const auth = getAuth();
//         onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUser(user);
//                 fetchSeats();
//             } else {
//                 navigate("/login");
//             }
//         });
//     }, [navigate]);

//     const fetchSeats = async () => {
//         if (!hallId) {
//             toast.error("No hall selected. Please select a hall first.");
//             navigate("/student/select-hall");
//             return;
//         }

//         try {
//             const hallDoc = await getDoc(doc(db, "examHalls", hallId));
//             if (!hallDoc.exists()) {
//                 toast.error("Hall not found in Firestore.");
//                 return;
//             }

//             const hallCapacity = hallDoc.data().capacity;
//             console.log("Hall capacity:", hallCapacity);

//             const seatAllocationsSnapshot = await getDocs(
//                 query(collection(db, "seatAllocations"), where("hall", "==", hallId))
//             );
//             const allocatedSeats = seatAllocationsSnapshot.docs.map((doc) => doc.data());
//             console.log("Allocated seats:", allocatedSeats);

//             const allSeats = Array.from({ length: hallCapacity }, (_, i) => `Seat ${i + 1}`);
//             const availableSeats = allSeats.filter(
//                 (seat) => !allocatedSeats.some((allocated) => allocated.seat === seat)
//             );
//             console.log("Available seats (before department check):", availableSeats);

//             const departmentSeats = allocatedSeats.filter(
//                 (allocated) => allocated.department === department
//             );
//             console.log("Department seats:", departmentSeats.length);

//             if (departmentSeats.length >= 50) {
//                 toast.error("Maximum department seats reached.");
//                 navigate("/student/select-hall");
//                 return;
//             }

//             const tables = [];
//             for (let i = 0; i < hallCapacity; i += 3) {
//                 tables.push(allSeats.slice(i, i + 3));
//             }

//             const validSeats = availableSeats.filter((seat) => {
//                 const table = tables.find((table) => table.includes(seat));
//                 return !table?.some((tableSeat) =>
//                     allocatedSeats.some(
//                         (allocated) =>
//                             allocated.seat === tableSeat && allocated.department === department
//                     )
//                 );
//             });

//             console.log("Valid seats after department rules:", validSeats);
//             setSeats(validSeats);
//         } catch (error) {
//             console.error("Error in fetchSeats:", error);
//             toast.error("Failed to fetch seats. See console for details.");
//         }
//     };

//     const handleSubmit = async () => {
//         if (!selectedSeat) {
//             toast.error("Please select a seat.");
//             return;
//         }

//         setLoading(true);
//         try {
//             await addDoc(collection(db, "seatAllocations"), {
//                 userId: user.uid,
//                 hall: hallId,
//                 seat: selectedSeat,
//                 exam: localStorage.getItem("selectedExam"),
//                 name: localStorage.getItem("studentName"),
//                 matricNumber: localStorage.getItem("matricNumber"),
//                 department: department,
//                 level: localStorage.getItem("level"),
//             });
//             toast.success("Seat booked successfully!");
//             setTimeout(() => navigate("/student"), 2000);
//         } catch (error) {
//             console.error("Error saving seat:", error);
//             toast.error("Failed to save seat. See console for details.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="w-full flex h-screen overflow-hidden">
//             <StudentSidebar />
//             <div className="flex-1 flex flex-col">
//                 <div className="flex-1 bg-zinc-100 p-6 overflow-y-auto">
//                     <ToastContainer />
//                     <h2 className="text-2xl font-bold mb-6">Select Seat</h2>
//                     {seats.length === 0 ? (
//                         <div className="bg-yellow-100 p-4 rounded-lg">
//                             No seats available. Please select another hall.
//                         </div>
//                     ) : (
//                         <div className="bg-white p-6 rounded-lg shadow-md">
//                             <label className="block text-lg font-medium text-zinc-800 mb-2">
//                                 Available Seats: {seats.length}
//                             </label>
//                             <select
//                                 className="w-full p-2 border border-zinc-300 rounded-lg"
//                                 value={selectedSeat}
//                                 onChange={(e) => setSelectedSeat(e.target.value)}
//                             >
//                                 <option value="">-- Choose a Seat --</option>
//                                 {seats.map((seat) => (
//                                     <option key={seat} value={seat}>
//                                         {seat}
//                                     </option>
//                                 ))}
//                             </select>
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={loading}
//                                 className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//                             >
//                                 {loading ? "Submitting..." : "Submit"}
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SelectSeat;