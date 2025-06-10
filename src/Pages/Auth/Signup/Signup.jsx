import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiBook } from 'react-icons/fi';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [dpartm, setDpartm] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Department options
  const departments = [
    'Computer Science',
    'ICT',
    'Micro-Biology',
    'Industral Chemisrty',
    'Physics and Eletronics',
    'Bio-Chemistry',
    'Geology Science'
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        firstName: fname,
        lastName: lname,
        department: dpartm,
        role: role,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!", {
        position: "top-center",
      });

      await signOut(auth);
      navigate('/Login');
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/70 text-sm">Welcome</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstname" className="block text-sm font-medium text-white/80">First Name</label>
              <div className="relative">
                <input
                  id="firstname"
                  type="text"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10"
                  placeholder="John"
                />
                <FiUser className="h-5 w-5 text-white/50 absolute left-3 top-3" />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="lastname" className="block text-sm font-medium text-white/80">Last Name</label>
              <div className="relative">
                <input
                  id="lastname"
                  type="text"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10"
                  placeholder="Doe"
                />
                <FiUser className="h-5 w-5 text-white/50 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-white/80">Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10"
                placeholder="your@email.com"
              />
              <FiMail className="h-5 w-5 text-white/50 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-white/80">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10"
                placeholder="••••••••"
              />
              <FiLock className="h-5 w-5 text-white/50 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="department" className="block text-sm font-medium text-white/80">Department</label>
            <div className="relative">
              <select
                id="department"
                value={dpartm}
                onChange={(e) => setDpartm(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent pl-10 pr-8 appearance-none"
              >
                <option value="" disabled className="text-gray-900">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="text-gray-900">{dept}</option>
                ))}
              </select>
              <FiBook className="h-5 w-5 text-white/50 absolute left-3 top-3" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">Role</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-white/30"
                />
                <span className="text-white">Student</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-white/30"
                />
                <span className="text-white">Admin</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="courseAdviser"
                  checked={role === "courseAdviser"}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-white/30"
                />
                <span className="text-white">Course Adviser</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium transition-colors hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;