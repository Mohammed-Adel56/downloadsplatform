import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "https://downloadsplatform.com/api/user/notifications",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setNotifications(response.data.notifications);
      setUnreadCount(
        response.data.notifications.filter((n) => !n.read_at).length
      );
    } catch (error) {
      // console.error("Error fetching notifications:", error);
      toast.error("فشل في تحميل الاشعارات");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `https://downloadsplatform.com/api/user/notifications/${notificationId}/read`,
        {},
        { withCredentials: true, headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        } }
      );
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      // console.error("Error marking notification as read:", error);
      toast.error("فشل في  جعل الاشعار مقروا");
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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={onMenuClick}
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>

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
      </div>
    </header>
  );
};

export default Header;
