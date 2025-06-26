import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiChat } from 'react-icons/bi';
import { FaUniversity, FaBell, FaCalendarAlt, FaChevronDown, FaChevronRight, FaSearch, FaUserGraduate, FaUserCog } from 'react-icons/fa';
import { FaGears } from 'react-icons/fa6';
import { MdEventSeat, MdLogout, MdOutlineHeadsetMic, MdSpaceDashboard } from 'react-icons/md';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Import the `auth` object

const Sidebar = () => {
    const [open, setOpen] = useState(true);
    const [submenu, setSubMenus] = useState({
        students: false, // Ensure this key matches the key in the Menus array
        seats: false,
        schedule: false,
        users: false,
        settings: false,
    });

    const navigate = useNavigate();

    const toggleSubMenu = (menu) => {
        setSubMenus((prev) => ({
            ...prev, [menu]: !prev[menu],
        }));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth); // Use the imported `auth` object
            localStorage.removeItem("userToken");
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    const Menus = [
        { title: "Dashboard", icon: <MdSpaceDashboard />, path: "/admin" },
        {
            title: "Manage Students",
            icon: <FaUserGraduate />,
            subMenu: [
                { title: "Students", path: "/admin/view-students" }, // Matches the route in App.jsx
                { title: "Course Registration", path: "/admin/course-registration" },
            ],
            key: "students",
        },
        { title: "Create Hall", path: "/admin/create-hall", icon: <MdEventSeat /> }, // Matches the route in App.jsx
        //{ title: "Seat Allocation", icon: <MdEventSeat />, subMenu: ["Allocate Seats", "View Allocations"], key: "seats" },
        {
            title: "Exam Schedule", icon: <FaCalendarAlt />, subMenu: [
                { title: "Exam Scheduling", path: "/admin/exam-schedule" }, // Matches the route in App.jsx
                { title: "View Timetable", path: "/admin/view-timetable" }, // Matches the route in App.jsx
            ], key: "schedule"
        },
        { title: "Messages", icon: <BiChat /> },
        { title: "User Management", icon: <FaUserCog />, subMenu: ["Manage Admins", "Manage Students"], key: "users" },
        { title: "Settings", icon: <FaGears />, subMenu: ["Profile", "Security", "Notifications"], key: "settings" },
        { title: "Support", icon: <MdOutlineHeadsetMic /> },
        { title: "Log Out", icon: <MdLogout />, gap: true, logout: true },
    ];

    return (
        <div>
            <div className={`${open ? "w-72 p-5" : "w-20 p-4"} bg-zinc-900 h-full min-h-screen pt-8 relative duration-300 ease-in-out`}>
                {/* Toggle Button Section */}
                <div
                    className={`absolute cursor-pointer -right-4 top-9 w-8 h-8 p-0.5 bg-zinc-50 border-zinc-50 border-2 rounded-full text-xl text-zinc-900 flex items-center justify-center ${!open && "rotate-180"} transition-all ease-in-out duration-300`}
                    onClick={() => setOpen(!open)}
                >
                    {open ? <TbLayoutSidebarLeftExpand /> : <TbLayoutSidebarLeftCollapse />}
                </div>

                {/* Logo and Title Section */}
                <div className="flex gap-x-4 items-center">
                    <img src="../../assets/Logos.jpg" alt="" className={`w-10 h-10 rounded-full object-cover object-center cursor-pointer ease-in-out duration-3 ${open && "rotate-[360deg]"}`} />
                    <h1 className={`text-zinc-50 origin-left font-semibold text-xl duration-200 ease-in-out ${!open && "scale-0"}`}>
                        Admin's Dashboard
                    </h1>
                </div>

                {/* Sidebar Navbar Items Section */}
                <ul className='pt-6 space-y-0.5'>
                    {Menus.map((Menu, index) => (
                        <li
                            key={index}
                            className={`flex flex-col rounded-md py-3 px-4 cursor-pointer hover:text-white text-zinc-50 hover:bg-zinc-800/50 transition-all ease-in-out duration-300 ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-zinc-800/40"}`}
                            onClick={() => {
                                if (Menu.logout) {
                                    handleLogout(); // Handle logout
                                } else if (Menu.subMenu) {
                                    toggleSubMenu(Menu.key); // Toggle submenu
                                } else if (Menu.path) {
                                    navigate(Menu.path); // Navigate to the specified path
                                }
                            }}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{Menu.icon}</span>
                                    <span className={`${!open && "hidden"} origin-left ease-in-out duration-300`}>{Menu.title}</span>
                                </div>
                                {Menu.subMenu && (
                                    <span className={`ml-auto cursor-pointer text-sm ${submenu[Menu.key] ? "rotate-180" : ""} transition-transform ease-in-out duration-300 ${!open ? "hidden" : ""}`}>
                                        {submenu[Menu.key] ? <FaChevronDown /> : <FaChevronRight />}
                                    </span>
                                )}
                            </div>

                            {/* Dropdown Items */}
                            {Menu.subMenu && submenu[Menu.key] && (
                                <ul className='pl-3 pt-4 text-zinc-300'>
                                    {Menu.subMenu.map((subItem, subIndex) => (
                                        <li
                                            key={subIndex}
                                            className='text-sm flex items-center gap-x-2 py-3 px-2 hover:bg-zinc-800 rounded-lg'
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the parent onClick from firing
                                                navigate(subItem.path); // Navigate to the submenu item's path
                                            }}
                                        >
                                            <span className="text-zinc-4">
                                                <FaChevronRight className='text-xs' />
                                            </span>
                                            {subItem.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;