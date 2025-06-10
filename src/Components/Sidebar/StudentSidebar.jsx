import React, { useState, useEffect } from 'react';
import { BiChat } from 'react-icons/bi';
import { FaUniversity, FaBell, FaCalendarAlt, FaChevronDown, FaChevronRight, FaSearch } from 'react-icons/fa';
import { FaGears } from 'react-icons/fa6';
import { MdEventSeat, MdLogout, MdOutlineHeadsetMic, MdSpaceDashboard } from 'react-icons/md';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'react-icons/tb';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const StudentSidebar = () => {
    const [open, setOpen] = useState(true);
    const [submenu, setSubMenus] = useState({
        calender: false,
        support: false,
        tables: false,
        analytics: false,
    });
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    // Fetch unread notifications count
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });

        return () => unsubscribe();
    }, []);

    const toggleSubMenu = (menu) => {
        setSubMenus((prev) => ({
            ...prev, [menu]: !prev[menu],
        }));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("userToken");
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error("Failed to log out. Please try again.");
        }
    };

    const handleMenuItemClick = (Menu) => {
        if (Menu.logout) {
            handleLogout();
        } else if (Menu.subMenu) {
            toggleSubMenu(Menu.key);
        } else if (Menu.path) {
            navigate(Menu.path);
        } else if (Menu.notifications) {
            navigate('/notifications');
        }
    };

    const Menus = [
        { title: "Dashboard", icon: <MdSpaceDashboard />, path: "/student" },
        {
            title: "Exam Halls", icon: <FaUniversity />, gap: true, subMenu: [
                { title: "Select Exam Hall", path: "/student/select-hall" },
            ], key: "Exam Halls"
        },
        { title: "My Allocation", icon: <MdEventSeat />, path: "/student/my-allocation" },
        {
            title: "Exam Timetable",
            icon: <FaCalendarAlt />,
            path: "/student/exam-timetable"
        },
        {
            title: "Notifications",
            icon: (
                <div className="relative">
                    <FaBell />
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
            ),
            path: "/notifications",
            notifications: true
        },
        { title: "Messages", icon: <BiChat /> },
        { title: "Setting", icon: <FaGears />, subMenu: ["Profile", "Security", "Notifications"], key: "settings" },
        { title: "Log Out", icon: <MdLogout />, gap: true, logout: true },
    ];

    return (
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
                <img src="../assets/Logo.jpg" alt="" className={`w-10 h-10 rounded-full object-cover object-center cursor-pointer ease-in-out duration-3 ${open && "rotate-[360deg]"}`} />
                <h1 className={`text-zinc-50 origin-left font-semibold text-xl duration-200 ease-in-out ${!open && "scale-0"}`}>
                    Student Dashboard
                </h1>
            </div>

            {/* Sidebar Navbar Items Section */}
            <ul className='pt-6 space-y-0.5'>
                {Menus.map((Menu, index) => (
                    <li
                        key={index}
                        className={`flex flex-col rounded-md py-3 px-4 cursor-pointer hover:text-white text-zinc-50 hover:bg-zinc-800/50 transition-all ease-in-out duration-300 ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-zinc-800/40"}`}
                        onClick={() => handleMenuItemClick(Menu)}
                    >
                        <div className="flex items-center justify-between gap-x-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{Menu.icon}</span>
                                <span className={`${!open && "hidden"} origin-left ease-in-out duration-300`}>{Menu.title}</span>
                            </div>
                            {Menu.subMenu && (
                                <span
                                    className={`ml-auto cursor-pointer text-sm ${submenu[Menu.key] ? "rotate-180" : ""} transition-transform ease-in-out duration-300 ${!open ? "hidden" : ""}`}
                                >
                                    {submenu[Menu.key] ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                            )}
                        </div>

                        {/* Dropdown Items */}
                        {Menu.subMenu && submenu[Menu.key] && (
                            <ul className='pl-3 pt-4 text-zinc-300'>
                                {Menu.subMenu.map((submenuItem, subIndex) => (
                                    <li
                                        key={subIndex}
                                        className='text-sm flex items-center gap-x-2 py-3 px-2 hover:bg-zinc-800 rounded-lg'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (typeof submenuItem === 'object' && submenuItem.path) {
                                                navigate(submenuItem.path);
                                            }
                                        }}
                                    >
                                        <span className="text-zinc-4">
                                            <FaChevronRight className='text-xs' />
                                        </span>
                                        {typeof submenuItem === 'object' ? (
                                            submenuItem.title
                                        ) : (
                                            submenuItem
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default StudentSidebar;