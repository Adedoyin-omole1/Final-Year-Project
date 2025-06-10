import React, { useState, useEffect } from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch real-time notification count
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

    return (
        <div className="w-full h-[8ch] px-12 bg-zinc-50 shadow-md flex items-center justify-between">
            <div className="w-96 border border-zinc-300 rounded-full h-11 flex items-center justify-center">
                <input
                    type="text"
                    placeholder='Search..'
                    className="flex-1 h-full rounded-full outline-none border-none bg-zinc-50 px-4 text-zinc-400"
                />
                <button className="px-4 h-full flex items-center justify-center text-base text-zinc-600 border-l border-zinc-300">
                    <FaSearch />
                </button>
            </div>
            <div className="flex items-center gap-x-8">
                {/* Notification with real-time count */}
                <button className='relative'>
                    {unreadCount > 0 && (
                        <div className="w-5 h-5 bg-zinc-50 flex items-center justify-center absolute -top-1.5 -right-2.5 rounded-full p-0.5">
                            <span className='bg-red-600 text-white rounded-full w-full h-full flex items-center justify-center text-xs'>
                                {unreadCount}
                            </span>
                        </div>
                    )}
                    <FaBell className='text-xl text-zinc-600' />
                </button>
                {/* Profile Image */}
                <img
                    src="../../assets/woman.jpg"
                    alt="Profile"
                    className="w-11 h-11 rounded-full object-cover object-center cursor-pointer"
                />
            </div>
        </div>
    );
}

export default Navbar;