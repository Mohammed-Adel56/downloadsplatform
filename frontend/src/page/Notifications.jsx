import { useState, useEffect } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const Notifications = () => {
  const [targetAudience, setTargetAudience] = useState("الكل");
  const [subscriptionTier, setSubscriptionTier] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          withCredentials: true,
        }
      );
      setNotifications(response.data.notifications);
    } catch (error) {
      // console.error("Error fetching notifications:", error);
      toast.error("فشل في تحميل الإشعارات");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title: formData.title,
          description: formData.description,
          targetAudience,
          subscriptionTier:
            targetAudience === "المشتركين فقط" ? subscriptionTier : null,
        },
        { withCredentials: true }
      );

      toast.success("تم إرسال الإشعار بنجاح");

      // Reset form
      setFormData({ title: "", description: "" });
      setTargetAudience("الكل");
      setSubscriptionTier("");

      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      // console.error("Error sending notification:", error);
      toast.error(error.response?.data?.error || "فشل في إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        withCredentials: true,
      });
      toast.success("تم حذف الإشعار بنجاح");
      fetchNotifications();
    } catch (error) {
      // console.error("Error deleting notification:", error);
      toast.error("فشل في حذف الإشعار");
    }
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الإشعارات</h1>
      </div>

      {/* New Notification Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">إرسال إشعار جديد</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Title */}
          <div>
            <label className="block text-gray-700 mb-2">عنوان الإشعار</label>
            <input
              type="text"
              name="title"
              className="w-full p-2 border rounded-md"
              placeholder="أدخل عنوان الإشعار"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">الوصف</label>
            <textarea
              name="description"
              className="w-full p-2 border rounded-md h-32"
              placeholder="اكتب وصف الإشعار هنا..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-gray-700 mb-2">الفئة المستهدفة</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTargetAudience("الكل")}
                className={`flex-1 py-2 rounded ${
                  targetAudience === "الكل"
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience("المشتركين فقط")}
                className={`flex-1 py-2 rounded ${
                  targetAudience === "المشتركين فقط"
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                المشتركين فقط
              </button>
            </div>
          </div>

          {/* Subscription Tier - Only show if targetAudience is "المشتركين فقط" */}
          {targetAudience === "المشتركين فقط" && (
            <div>
              <label className="block text-gray-700 mb-2">فئة الاشتراك</label>
              <div className="flex gap-3">
                {["اكتمال الحساب", "الفئة الأولى", "الفئة الثانية"].map(
                  (tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSubscriptionTier(tier)}
                      className={`flex-1 py-2 rounded ${
                        subscriptionTier === tier
                          ? "bg-blue-600 text-white"
                          : "border"
                      }`}
                    >
                      {tier}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md w-full"
            disabled={loading}
          >
            {loading ? "جاري الإرسال..." : "إرسال الإشعار"}
          </button>
        </form>
      </div>

      {/* Sent Notifications Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold">سجل الإشعارات المرسلة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  عنوان الإشعار
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الفئة المستهدفة
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  تاريخ الإرسال
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  فئة الاشتراك
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.targetAudience}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(notification.sent_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.subscriptionTier || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
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
    </div>
  );
};

export default Notifications;
