import { FiMenu, FiBell, FiUser, FiSearch } from 'react-icons/fi';

const TopNavbar = ({ setSidebarOpen }) => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Hamburger menu and search */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setSidebarOpen(prev => !prev)}
                        >
                            <FiMenu className="h-6 w-6" />
                        </button>

                        <div className="ml-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search"
                            />
                        </div>
                    </div>

                    {/* Right side - Notifications and profile */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                        >
                            <FiBell className="h-6 w-6" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="flex text-sm rounded-full focus:outline-none"
                                    id="user-menu"
                                >
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <FiUser className="h-5 w-5" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;