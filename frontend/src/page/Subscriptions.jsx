import { useState, useEffect } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const Subscriptions = () => {
  const [subscriptionType, setSubscriptionType] = useState("مدفوع");
  const [subscriptionTier, setSubscriptionTier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("جوجل باي");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    start_date: "",
    end_date: "",
    country: "",
  });

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/subscriptions",
        {
          withCredentials: true,
        }
      );
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      // console.error("Error fetching subscriptions:", error);
      toast.error("فشل في تحميل الاشتراكات");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      start_date: "",
      end_date: "",
      country: "",
    });
    setSubscriptionType("مدفوع");
    setSubscriptionTier("");
    setPaymentMethod("جوجل باي");
    setEditMode(false);
    setEditId(null);
  };
  // Add this function to validate dates
  const validateDates = (start_date, end_date) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    return start < end;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        type: subscriptionType,
        tier: subscriptionTier,
        payment_method: paymentMethod,
      };

      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/subscriptions/${editId}`,
          data,
          { withCredentials: true }
        );
        toast.success("تم تحديث الاشتراك بنجاح");
      } else {
        await axios.post("http://localhost:5000/api/subscriptions", data, {
          withCredentials: true,
        });
        toast.success("تم إضافة الاشتراك بنجاح");
      }

      fetchSubscriptions();
      resetForm();
    } catch (error) {
      // console.error("Error saving subscription:", error);
      toast.error(editMode ? "فشل في تحديث الاشتراك" : "فشل في إضافة الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setEditMode(true);
    setEditId(subscription.id);
    setFormData({
      name: subscription.name,
      email: subscription.email,
      phone: subscription.phone,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      country: subscription.country,
    });
    setSubscriptionType(subscription.type);
    setSubscriptionTier(subscription.tier);
    setPaymentMethod(subscription.payment_method);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الاشتراك؟")) return;

    try {
      await axios.delete(`http://localhost:5000/api/subscriptions/${id}`, {
        withCredentials: true,
      });
      toast.success("تم حذف الاشتراك بنجاح");
      fetchSubscriptions();
    } catch (error) {
      // console.error("Error deleting subscription:", error);
      toast.error("فشل في حذف الاشتراك");
    }
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الاشتراكات</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
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

      {/* Subscription Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? "تحديث الاشتراك" : "إضافة اشتراك جديد"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-gray-700 mb-2">اسم العميل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل الاسم"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Email/Phone */}
            <div>
              <label className="block text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="أدخل البريد الإلكتروني"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهاتف"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-700 mb-2">الدولة</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="أدخل الدولة"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-gray-700 mb-2">تاريخ البداية</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-gray-700 mb-2">تاريخ النهاية</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="block text-gray-700 mb-2">فئة الاشتراك</label>
              <div className="flex gap-3">
                {["اكتمال الحساب", "الفئة الأولى", "الفئة الثانية"].map(
                  (tier) => (
                    <button
                      type="button"
                      key={tier}
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

            {/* Subscription Type */}
            <div>
              <label className="block text-gray-700 mb-2">نوع الاشتراك</label>
              <div className="flex gap-3">
                {["مدفوع", "غير مدفوع"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSubscriptionType(type)}
                    className={`flex-1 py-2 rounded ${
                      subscriptionType === type
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading
                ? "جاري الحفظ..."
                : editMode
                ? "تحديث الاشتراك"
                : "إضافة اشتراك جديد"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-6 py-2 rounded-md"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold">إدارة الاشتراكات الحالية</h2>
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
                  رقم الهاتف
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الدولة
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  تاريخ البداية
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  تاريخ النهاية
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  فئة الاشتراك
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  نوع الاشتراك
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.country}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(subscription.start_date).toLocaleDateString(
                      "ar-EG"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(subscription.end_date).toLocaleDateString(
                      "ar-EG"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.tier}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {subscription.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
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

export default Subscriptions;
