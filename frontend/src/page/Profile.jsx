import { useContext, useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import { SignupContext } from "../context/SignupContext";

const Profile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userData, setUserData } = useContext(SignupContext);

  const [formData, setFormData] = useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    birthDate: "",
    country: "",
    gender: "",
    phone: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/auth/check-auth",
          {
            withCredentials: true,
          }
        );
        if (response.data.authenticated) {
          setFormData(response.data.user);
        } else {
          toast.error("من فضلك سجل اولا");
          // Redirect to login if needed
        }
      } catch (error) {
        // console.error("Error fetching user:", error);
        toast.error("فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:5000/api/auth/updateUserDetails",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("تم تحديث البيانات بنجاح");
      // Update context with new user data
      setUserData(response.data.user);
    } catch (err) {
      // console.error("Update error:", err);
      toast.error(err.response?.data?.error || "فشل في تحديث البيانات");
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-8">البيانات الشخصية</h1>

        <form onSubmit={handleUpdate} className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-gray-700 mb-2">
                الاسم الأول
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="w-full p-2 border rounded-md"
                placeholder="أدخل الاسم"
                value={formData.firstName || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-gray-700 mb-2">
                الاسم الأخير
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="w-full p-2 border rounded-md"
                placeholder="أدخل الاسم"
                value={formData.lastName || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-gray-700 mb-2">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                className="w-full p-2 border rounded-md"
                value={formData.birthDate || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-gray-700 mb-2">
                الدولة
              </label>
              <input
                type="text"
                id="country"
                name="country"
                className="w-full p-2 border rounded-md"
                placeholder="أدخل الدولة"
                value={formData.country || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="mt-6">
            <label className="block text-gray-700 mb-2">الجنس</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleGenderSelect("ذكر")}
                className={`px-6 py-2 rounded-md ${
                  formData.gender === "ذكر"
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect("أنثى")}
                className={`px-6 py-2 rounded-md ${
                  formData.gender === "أنثى"
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                أنثى
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md flex-1"
              disabled={loading}
            >
              {loading ? "جاري التحديث..." : "تحديث"}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="border px-6 py-2 rounded-md"
            >
              الغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Profile;
