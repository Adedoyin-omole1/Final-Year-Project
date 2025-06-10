import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = [];
            snapshot.forEach((doc) => {
                notifs.push({ id: doc.id, ...doc.data() });
            });
            setNotifications(notifs);
            setUnreadCount(notifs.length);
        });

        return () => unsubscribe();
    }, [auth]);

    const markAsRead = async (notificationId) => {
        await updateDoc(doc(db, 'notifications', notificationId), {
            read: true
        });
    };

    const markAllAsRead = async () => {
        const batch = notifications.map(notification =>
            updateDoc(doc(db, 'notifications', notification.id), { read: true })
        );
        await Promise.all(batch);
    };

    const deleteNotification = async (notificationId) => {
        await deleteDoc(doc(db, 'notifications', notificationId));
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-10">
                    <FiBell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No new notifications</h3>
                    <p className="mt-1 text-gray-500">You'll see notifications here when you receive them</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-white shadow-sm'}`}
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{notification.message}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(notification.timestamp?.toDate()).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-gray-400 hover:text-blue-500"
                                        title="Mark as read"
                                    >
                                        <FiCheck />
                                    </button>
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        title="Delete"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </div>
                            {notification.metadata?.courseCode && (
                                <div className="mt-2">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {notification.metadata.courseCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;