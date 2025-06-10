import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "students"));
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((student) => student.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Students</h2>
      <button onClick={() => navigate("/add-student")} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        + Add Student
      </button>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Name</th>
              <th className="border p-3">Matric Number</th>
              <th className="border p-3">Department</th>
              <th className="border p-3">Level</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="border p-3">{student.name}</td>
                <td className="border p-3">{student.matricNumber}</td>
                <td className="border p-3">{student.department}</td>
                <td className="border p-3">{student.level}</td>
                <td className="border p-3">
                  <button onClick={() => deleteStudent(student.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudents;
