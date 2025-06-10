import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './Pages/Auth/Login/Login';
import Signup from './Pages/Auth/Signup/Signup';
import Admin from './Pages/AdminPages/Admin';
import { ToastContainer } from 'react-toastify';
import { auth } from './firebase';
import Students from './Pages/StudentPages/Students';
import AddStudent from './Pages/AdminPages/AddStudents';
import ViewStudent from './Pages/AdminPages/ViewStudents';
import EditStudent from './Pages/AdminPages/EditStudents';
import SelectHall from './Pages/StudentPages/SelectHall';
import StudentForm from './Pages/StudentPages/StudentsForm';
import StudentTimetable from './Pages/StudentPages/StudentTimetable';
import CreateExamHall from './Pages/AdminPages/CreateExamHall';
import MyAllocation from './Pages/StudentPages/MyAllocation';
import Notifications from './Pages/Notifications/Notifications';
import CourseAdviser from './Pages/CourseAdviserPages/CourseAdviser';
import MyStudentsCourses from './Pages/CourseAdviserPages/MyStudents';
import CourseRegistrationsView from './Pages/CourseAdviserPages/CourseRegistration';

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  const [sidebarToggle, setSidebarToggle] = useState(false);

  return (
    <>
      <div className='text-dark h-[100vh] flex'>
        <Routes>
          <Route path='/' element={user ? (localStorage.getItem('userRole') === 'admin' ? <Navigate to="/Admin" /> : localStorage.getItem('userRole') === 'courseAdviser' ?
            <Navigate to="/CourseAdviser" /> :
            <Navigate to="/student" />
          ) :
            <Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/Admin' element={<Admin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/student' element={<Students />} />
          <Route path='/admin/add-students' element={<AddStudent />} />
          <Route path='/admin/view-students' element={<ViewStudent />} />
          <Route path='/admin/edit-students' element={<EditStudent />} />
          <Route path='/student/select-hall' element={<SelectHall />} /> {/* Fixed path */}
          <Route path='/admin/create-hall' element={<CreateExamHall />} />
          {/* <Route path='/notifications' element={<Notifications />} /> */}
          <Route path='/student/form' element={<StudentForm />} />
          <Route path='/student/exam-timetable' element={<StudentTimetable />} />
          <Route path='/student/my-allocation' element={<MyAllocation />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/CourseAdviser' element={<CourseAdviser />} />
          <Route path='/course-adviser/students' element={<MyStudentsCourses />} />
          <Route path='/course-adviser/course-registration' element={<CourseRegistrationsView />} />


        </Routes>
        <ToastContainer />
      </div>
    </>
  );
}

export default App;