import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiShoppingBag,
  FiMonitor,
  FiCode,
  FiCreditCard,
  FiBell,
  FiUser,
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";

import { useContext, useEffect, useState } from "react";
import { SignupContext } from "../../context/SignupContext";
import axios from "axios";
import toast from "react-hot-toast";

const menuAdmin = [
  { path: "/dashboard", icon: FiHome, label: "الصفحة الرئيسية" },
  { path: "/dashboard/users", icon: FiUsers, label: "إدارة المستخدم" },
  { path: "/dashboard/content", icon: FiFolder, label: "إدارة المحتوى" },
  { path: "/dashboard/services", icon: FiShoppingBag, label: "متجر الخدمات" },
  { path: "/dashboard/ads", icon: FiMonitor, label: "إدارة الإعلانات" },
  { path: "/dashboard/api", icon: FiCode, label: "API إدارة" },
  { path: "/dashboard/subscriptions", icon: FiCreditCard, label: "الاشتراكات" },
  { path: "/dashboard/notifications", icon: FiBell, label: "الاشعارات" },
  { path: "/dashboard/profile", icon: FiUser, label: "الملف الشخصي" },
];
const menuUsers = [
  { path: "/dashboard/profile", icon: FiUser, label: "الملف الشخصي" },
  { path: "/dashboard/ads", icon: FiMonitor, label: "إدارة الإعلانات" },
];

const Sidebar = ({ open, setOpen }) => {
  const { logout, isAdmin } = useContext(SignupContext);
  const [menuShow, setMenuShow] = useState([]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      // console.log(res.data);
      logout(); // Call the logout function from context to clear user data
      navigate("/"); // Redirect to home or login page
    } catch (error) {
      // console.error("Logout error:", error);
      toast.error("فشل في عمل تسجيل خروج ");
    }
  };
  useEffect(() => {
    if (isAdmin) {
      setMenuShow(menuAdmin);
    } else {
      setMenuShow(menuUsers);
    }
  }, [isAdmin]);
  return (
    <div className="z-50">
      <div
        className={` fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          open ? "opacity-100 block" : "opacity-0 hidden"
        } md:hidden`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 flex flex-col w-64 bg-white transform ease-in-out duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuShow.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon
                  className="ml-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md `}
            >
              <MdLogout
                className="ml-3 flex-shrink-0 h-6 w-6"
                aria-hidden="true"
              />
              تسجيل الخروج
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
