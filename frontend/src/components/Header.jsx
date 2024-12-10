import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // استيراد أيقونات القائمة من react-icons
import { SignupContext } from "../context/SignupContext";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // حالة للتحكم في إظهار القائمة
  const { userData, isAuthenticated, login, setUserData, setIsAuthenticated } =
    useContext(SignupContext);

  // دالة تبديل إظهار القائمة
  // console.log(isAuthenticated);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/notifications",
        { withCredentials: true }
      );
      setNotifications(response.data.notifications);
      setUnreadCount(
        response.data.notifications.filter((n) => !n.read_at).length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // toast.error("فشل في تحميل الإشعارات");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/user/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      // console.error("Error marking notification as read:", error);
      toast.error("فشل في جعل الاشعار مقروا");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex justify-between items-center py-4 px-8 ">
      <NavLink to="/">
        <div className="text-xl font-bold">Downloads-platform</div>
      </NavLink>

      <div className="sm:hidden">
        <button onClick={toggleMenu} className="text-2xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Centered Navigation Links */}
      <nav
        className={`${
          menuOpen ? "flex" : "hidden"
        } flex-col sm:flex sm:flex-row sm:space-x-4 items-center absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent z-10`}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-blue-500 font-semibold p-2" : "text-gray-700 p-2"
          }
          onClick={() => setMenuOpen(false)} // إغلاق القائمة عند النقر
        >
          الرئيسية
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            isActive ? "text-blue-500 font-semibold p-2" : "text-gray-700 p-2"
          }
          onClick={() => setMenuOpen(false)} // إغلاق القائمة عند النقر
        >
          المتجر
        </NavLink>
      </nav>
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                      الإشعارات
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                              !notification.read_at ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                notification.created_at
                              ).toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          لا توجد إشعارات جديدة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ml-3 relative">
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => navigate("/dashboard/profile")}
                >
                  <span className="sr-only">Open user menu</span>
                  <FiUser className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NavLink to="/register">
          <button className="hidden sm:block bg-blue-500 text-white py-1 px-4 rounded">
            سجل
          </button>
        </NavLink>
      )}
    </header>
  );
}

export default Header;
