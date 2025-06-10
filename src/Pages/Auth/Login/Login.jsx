import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase';
import { toast } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // List of departments
  const departments = [
    'Computer Science',
    'ICT',
    'Micro-Biology',
    'Industrial Chemistry',
    'Physics and Electronics',
    'Bio-Chemistry',
    'Geology Science'
  ];

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "Users", userId));
      if (!userDoc.exists()) {
        throw new Error("No user data found!");
      }

      const userData = userDoc.data();
      console.log("User Data:", userData);

      // Store department and role in localStorage
      localStorage.setItem('department', department);
      localStorage.setItem('userRole', userData.role || 'student');

      // Redirect based on role
      if (userData.role === "admin") {
        navigate("/Admin");
      } else if (userData.role === "courseAdviser") {
        navigate("/CourseAdviser");
      } else {
        navigate("/Student");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message, {
        position: "bottom-center",
      });
      // Sign out if there's an error with user data
      await auth.signOut();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password || !department) {
      toast.error("Please fill all fields", {
        position: "bottom-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful", {
        position: "top-center",
      });

      // Fetch user data after successful login
      await fetchUserData(userCredential.user.uid);
    } catch (error) {
      let errorMessage = error.message;

      // User-friendly error messages
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/user-disabled':
          errorMessage = "Account disabled";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Try again later";
          break;
        default:
          errorMessage = "Login failed. Please try again";
      }

      toast.error(errorMessage, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full flex flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen'>
      <div className='bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10 w-full max-w-md mx-4'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
          <p className='text-white/70'>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <label htmlFor="email" className='block text-sm font-medium text-white/80'>Email Address</label>
            <div className='relative'>
              <input
                type="email"
                id='email'
                className='w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all pl-10'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor="password" className='block text-sm font-medium text-white/80'>Password</label>
            <div className='relative'>
              <input
                type="password"
                id='password'
                className='w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all pl-10'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor="department" className='block text-sm font-medium text-white/80'>Department</label>
            <div className='relative'>
              <select
                id='department'
                className='w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10 pr-8 appearance-none'
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="" disabled className="text-gray-800">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className='text-gray-800'>{dept}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute right-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-white/70 text-sm'>
            Don't have an account?{' '}
            <Link to="/signup" className='text-blue-300 hover:text-blue-200 font-medium transition-colors hover:underline'>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;