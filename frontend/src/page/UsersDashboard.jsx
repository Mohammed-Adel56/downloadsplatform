import { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
const AdsManagement = () => {
  const [users, setUsers] = useState([]);
  const [userAds, setUserAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserAds();
  }, []);
  const usersData = [
    {
      id: "01",
      name: "أحمد",
      birthDate: "15-oc-99",
      gender: "ذكر",
      phone: "+01122994",
      email: "ah6.g@com",
      status: "Complete",
    },
    // Add more users as needed
  ];
  const userAdsData = [
    {
      id: "01",
      campaign: "كاميرا 4K خاصة",
      type: "الكترونيات",
      budget: "100$",
      targetAge: "17-40 عام",
      manager: "محمد علي",
      date: "20-30oct-23",
    },
    // Add more data as needed
  ];
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://downloadsplatform.com/api/users"
      );
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      // console.error("Error fetching users:", err);
      toast.error("فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };
  const fetchUserAds = async () => {
    try {
      const response = await axios.get(
        "https://downloadsplatform.com/api/advertisements",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setUserAds(response.data.advertisements);
    } catch (err) {
      // console.error("Error fetching user ads:", err);
      toast.error("فشل في تحميل الاعلانات");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await axios.delete(`https://downloadsplatform.com/api/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        // alert("تم حذف المستخدم بنجاح");
        toast.success("تم حذف المستخدم بنجاح");
      } catch (err) {
        setError("فشل في حذف المستخدم");
        // console.error("Error deleting user:", err);
      }
    }
  };
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await axios.put(
        `https://downloadsplatform.com/api/users/${userId}`,
        {
          status: newStatus,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      // alert("تم تحديث حالة المستخدم بنجاح");
      toast.success("تم تحديث حالة المستخدم بنجاح");
    } catch (err) {
      setError("فشل في تحديث حالة المستخدم");
      // console.error("Error updating user status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">عرض البيانات الأساسية</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => {
            // Handle export functionality
            const data = users.map((user) => ({
              ...user,
              status: user.status === "active" ? "نشط" : "غير نشط",
            }));
            const csvContent =
              "data:text/csv;charset=utf-8," +
              Object.keys(data[0]).join(",") +
              "\n" +
              data.map((row) => Object.values(row).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "users_data.csv");
            document.body.appendChild(link);
            link.click();
          }}
        >
          <span>تصدير</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">بيانات المستخدمين</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الرقم
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  تاريخ الميلاد
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الجنس
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الهاتف
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  البريد الإلكتروني
                </th>

                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {`${user.first_name} ${user.last_name}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.birth_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active" ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          handleUpdateUserStatus(
                            user.id,
                            user.status === "active" ? "inactive" : "active"
                          )
                        }
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-500 hover:text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Ads Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">إدارة إعلانات Google</h2>
        </div>
        <p className="text-gray-600 mb-4">
          لإنشاء حملة إعلانية جديدة، يرجى الأدنى ضبط تفاصيل الحملة من الميزانية،
          الكلمات المفتاحية، الجمهور المستهدف، ومدة الحملة.
        </p>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border">إيقاف</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white">
              تفعيل
            </button>
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الرقم
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الحملة الإعلانية
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الفئة
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الميزانية
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الفئة المستهدفة
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                المسؤول
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                المدة الزمنية
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userAds.map((ad) => (
              <tr key={ad.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{ad.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {ad.campaign}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{ad.type}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{ad.budget}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {ad.target_age}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {ad.manager}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {ad.duration}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    عرض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdsManagement;
