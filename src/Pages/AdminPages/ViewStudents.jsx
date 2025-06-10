import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase";
import SeatAssignmentModal from "./SeatAssignmentModal";
import Sidebar from "../../Components/Sidebar/sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewStudents = () => {
  // State management
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState([]);
  const [showClassroomView, setShowClassroomView] = useState(false);
  const [selectedHall, setSelectedHall] = useState("");

  // Color mappings
  const hallColors = {
    'NAS 1': 'border-blue-500',
    'NAS 2': 'border-green-500',
    'NAS 3': 'border-yellow-500',
    'NAS 4': 'border-purple-500',
    'NAS 5': 'border-pink-500',
  };

  const departmentColors = {
    'computer science': 'bg-red-200',
    'ict': 'bg-green-200',
    'mathematics': 'bg-purple-200',
    'physics': 'bg-indigo-200',
    'chemistry': 'bg-pink-200',
    'biology': 'bg-teal-200',
    'electrical engineering': 'bg-orange-200',
    'mechanical engineering': 'bg-amber-200',
  };

  // Fetch exam halls
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const hallsSnapshot = await getDocs(collection(db, "examHalls"));
        const hallsData = hallsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          color: hallColors[doc.data().name] || 'border-gray-500'
        }));
        setHalls(hallsData);
      } catch (error) {
        console.error("Error fetching halls:", error);
        toast.error("Failed to load exam halls");
      }
    };
    fetchHalls();
  }, []);

  // Fetch exam registrations with real-time updates
  useEffect(() => {
    let unsubscribe;

    const fetchRegistrations = async () => {
      try {
        const registrationsQuery =
          filterStatus === "all"
            ? collection(db, "examRegistrations")
            : query(
              collection(db, "examRegistrations"),
              where("status", "==", filterStatus)
            );

        unsubscribe = onSnapshot(
          registrationsQuery,
          (snapshot) => {
            try {
              const data = snapshot.docs.map(doc => {
                const regData = doc.data();
                return {
                  id: doc.id,
                  ...regData,
                  submittedAt: regData.submittedAt?.toDate()?.toLocaleString() || "N/A",
                  examDate: regData.examDate?.toDate()?.toLocaleDateString() || "N/A",
                  approvedAt: regData.approvedAt?.toDate()?.toLocaleString() || "N/A",
                  rejectedAt: regData.rejectedAt?.toDate()?.toLocaleDateString() || "N/A",
                  departmentColor: departmentColors[regData.department?.toLowerCase()] || 'bg-gray-200',
                  hallColor: hallColors[regData.hall] || 'border-gray-500'
                };
              });
              setRegistrations(data);
            } catch (error) {
              console.error("Error processing registration data:", error);
              toast.error("Failed to process registration data");
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error fetching registrations:", error);
            toast.error("Failed to load registrations");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error setting up listener:", error);
        setLoading(false);
      }
    };

    fetchRegistrations();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [filterStatus]);

  // Send notification to student
  const sendNotification = async (studentId, message) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId: studentId,
        message,
        read: false,
        timestamp: serverTimestamp(),
        type: "registration_update"
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Update registration status in Firestore
  const updateRegistrationStatus = async (
    registrationId,
    status,
    studentId
  ) => {
    const updateData = {
      status,
      [status === "approved" ? "approvedAt" : "rejectedAt"]: serverTimestamp(),
      ...(status === "rejected" && { hall: null, seat: null })
    };

    await updateDoc(doc(db, "examRegistrations", registrationId), updateData);

    const message =
      status === "approved"
        ? "Your exam registration has been approved!"
        : "Your exam registration has been rejected. Please contact support.";
    await sendNotification(studentId, message);
  };

  // Handle registration status change
  const handleStatusChange = async (registration, newStatus) => {
    try {
      setLoading(true);
      if (newStatus === "approved") {
        setCurrentRegistration(registration);
        setShowSeatModal(true);
      } else {
        await updateRegistrationStatus(
          registration.id,
          newStatus,
          registration.studentId
        );
        toast.success(`Registration ${newStatus} successfully`);
      }
    } catch (error) {
      console.error(`Error ${newStatus} registration:`, error);
      toast.error(`Failed to ${newStatus} registration`);
    } finally {
      setLoading(false);
    }
  };

  // Handle approval success from modal
  const handleApproveSuccess = async (registrationId, studentId) => {
    try {
      await updateRegistrationStatus(registrationId, "approved", studentId);
      setRegistrations(prev =>
        prev.map(r =>
          r.id === registrationId ? { ...r, status: "approved" } : r
        )
      );
      toast.success("Registration approved successfully!");
    } catch (error) {
      console.error("Error updating local state:", error);
      toast.error("Failed to update local state after approval");
    }
  };

  // Print approved registrations
  const handlePrint = () => {
    const approvedRegistrations = registrations.filter(
      reg => reg.status === "approved"
    );

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Approved Student Registrations</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #2d3748; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .color-dot { 
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Approved Exam Registrations</h1>
          <div>Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Matric No</th>
                <th>Dept</th>
                <th>Level</th>
                <th>Courses</th>
                <th>Date</th>
                <th>Hall</th>
                <th>Seat</th>
              </tr>
            </thead>
            <tbody>
              ${approvedRegistrations.length
        ? approvedRegistrations
          .map(r => `
                        <tr>
                          <td>${r.name || "N/A"}</td>
                          <td>${r.matricNumber || "N/A"}</td>
                          <td><span class="color-dot" style="background-color: ${departmentColors[r.department?.toLowerCase()] || '#e5e7eb'}"></span>${r.department || "N/A"}</td>
                          <td>${r.level || "N/A"}</td>
                          <td><ul>${(r.courses || [])
              .map(c => `<li>${c}</li>`)
              .join("")}</ul></td>
                          <td>${r.examDate}</td>
                          <td><span class="color-dot" style="border: 2px solid ${hallColors[r.hall]?.replace('border-', '#').replace('-500', '') || '#6b7280'}"></span>${r.hall || "N/A"}</td>
                          <td>${r.seat || "N/A"}</td>
                        </tr>`)
          .join("")
        : `<tr><td colspan="8" style="text-align:center;">No approved registrations.</td></tr>`
      }
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const term = searchTerm.toLowerCase();
    return (
      reg.name?.toLowerCase().includes(term) ||
      reg.matricNumber?.toLowerCase().includes(term) ||
      reg.department?.toLowerCase().includes(term) ||
      reg.level?.toString().includes(searchTerm) ||
      reg.courses?.some(c => c.toLowerCase().includes(term)) ||
      reg.hall?.toLowerCase().includes(term) ||
      reg.seat?.toString().includes(searchTerm)
    );
  });

  // Get combined color for seat
  const getSeatColor = (hallName, department) => {
    const hallColor = hallColors[hallName] || 'border-gray-500';
    const deptColor = departmentColors[department?.toLowerCase()] || 'bg-gray-200';

    return `${deptColor} ${hallColor}`;
  };

  // Render classroom layout
  const renderClassroomLayout = () => {
    if (!selectedHall) return null;

    const hall = halls.find(h => h.id === selectedHall);
    if (!hall) return null;

    // Get approved registrations for this hall
    const hallRegistrations = registrations.filter(
      reg => reg.hall === hall.name && reg.status === "approved"
    );

    // Create seat map
    const rows = hall.rows || 10;
    const cols = hall.columns || 10;
    const seatMap = Array(rows).fill().map(() => Array(cols).fill(null));

    hallRegistrations.forEach(reg => {
      if (reg.seat && typeof reg.seat === 'string') {
        const seatParts = reg.seat.split('-');
        if (seatParts.length === 2) {
          const row = parseInt(seatParts[0]);
          const col = parseInt(seatParts[1]);
          if (!isNaN(row) && !isNaN(col) && row >= 1 && row <= rows && col >= 1 && col <= cols) {
            seatMap[row - 1][col - 1] = reg;
          }
        }
      }
    });

    return (
      <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {hall.name} - Classroom Layout
          <span className={`ml-2 px-2 py-1 rounded text-xs border-2 ${hallColors[hall.name] || 'border-gray-500'}`}>
            Hall Color
          </span>
        </h3>

        <div className="overflow-auto">
          <div className="inline-block border border-gray-300">
            {/* Teacher's desk */}
            <div className="w-full bg-gray-300 text-center py-2 font-medium">
              Teacher's Desk
            </div>

            {/* Classroom grid */}
            <div className="grid gap-1 p-2" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridAutoRows: 'minmax(60px, auto)'
            }}>
              {seatMap.map((row, rowIndex) => (
                row.map((seat, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-16 h-16 border-2 flex items-center justify-center text-xs text-center p-1 ${seat
                      ? getSeatColor(hall.name, seat.department)
                      : 'bg-gray-100 border-gray-300'
                      }`}
                    title={seat ? `${seat.name}\n${seat.matricNumber}\n${seat.department}` : `Seat ${rowIndex + 1}-${colIndex + 1}`}
                  >
                    {seat ? (
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{seat.matricNumber}</span>
                        <span className="text-xs">{seat.department?.substring(0, 3)}</span>
                      </div>
                    ) : `${rowIndex + 1}-${colIndex + 1}`}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Department legend */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Department Colors:</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(hallRegistrations.map(r => r.department))).map(dept => (
              <div key={dept} className="flex items-center">
                <div className={`w-4 h-4 mr-1 ${departmentColors[dept?.toLowerCase()] || 'bg-gray-200'}`}></div>
                <span className="text-xs">{dept || 'Unknown'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Status badge component with refined styling
  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${status === "approved"
        ? "bg-green-50 text-green-700 ring-green-600/20"
        : status === "rejected"
          ? "bg-red-50 text-red-700 ring-red-600/20"
          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
        }`}
    >
      {status || "N/A"}
    </span>
  );

  // Department badge component with refined styling
  const DepartmentBadge = ({ department }) => (
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full mr-2 ring-1 ring-gray-200 ${departmentColors[department?.toLowerCase()] || 'bg-gray-200'}`}
        title={department}
      ></div>
      <span className="text-sm text-gray-700">{department || "N/A"}</span>
    </div>
  );

  // Hall badge component with refined styling
  const HallBadge = ({ hall }) => (
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full border-2 mr-2 ${hallColors[hall] || 'border-gray-500'}`}
        title={hall}
      ></div>
      <span className="text-sm text-gray-700">{hall || "N/A"}</span>
    </div>
  );

  // Action dropdown component with refined styling
  const ActionDropdown = ({ registration }) => (
    <div className="relative">
      <select
        className="block w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        defaultValue=""
        onChange={e => handleStatusChange(registration, e.target.value)}
        disabled={loading}
      >
        <option value="" disabled className="text-gray-400">
          Action…
        </option>
        {registration.status !== "approved" && (
          <option value="approved" className="text-green-700">Approve</option>
        )}
        {registration.status !== "rejected" && (
          <option value="rejected" className="text-red-700">Reject</option>
        )}
        {registration.status === "rejected" && (
          <option value="pending" className="text-yellow-700">Reconsider</option>
        )}
        {registration.status === "approved" && (
          <option value="approved" className="text-blue-700">Edit Seat</option>
        )}
      </select>
    </div>
  );

  return (
    <div className="w-full flex h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        toastClassName="shadow-lg rounded-lg"
        progressClassName="bg-blue-500"
      />
      <Sidebar />

      <main className="flex-grow px-6 py-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Student Exam Registrations
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and review student exam registration requests
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by Name, ID, Dept, Course, Hall, Seat"
            className="flex-grow max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            disabled={loading}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="all">All Registrations</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Approved
          </button>

          <button
            onClick={() => setShowClassroomView(!showClassroomView)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition shadow-md"
          >
            {showClassroomView ? 'Hide Classroom View' : 'Show Classroom View'}
          </button>
        </div>

        {showClassroomView && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Select a Hall</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>
            {renderClassroomLayout()}
          </div>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Name",
                    "Matric No",
                    "Department",
                    "Level",
                    "Courses",
                    "Exam Date",
                    "Hall",
                    "Seat",
                    "Status",
                    "Actions"
                  ].map(col => (
                    <th
                      key={col}
                      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center">
                      <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 mx-auto" />
                      <p className="mt-3 text-gray-500">Loading registrations...</p>
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-gray-500">
                      No registrations match your criteria
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reg.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.matricNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DepartmentBadge department={reg.department} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.level || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        {reg.courses ? (
                          <ul className="space-y-1">
                            {reg.courses.map((c, i) => (
                              <li key={i} className="truncate" title={c}>
                                {c}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.examDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <HallBadge hall={reg.hall} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.seat || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <ActionDropdown registration={reg} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showSeatModal && currentRegistration && (
          <SeatAssignmentModal
            registration={currentRegistration}
            halls={halls}
            onClose={() => setShowSeatModal(false)}
            onSuccess={id =>
              handleApproveSuccess(id, currentRegistration.studentId)
            }
          />
        )}
      </main>
    </div>
  );
};

export default ViewStudents;