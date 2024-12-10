import { useContext, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { SignupContext } from "../context/SignupContext";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const { userData, forgotPassword, setUserData } = useContext(SignupContext);

  const navigate = useNavigate();

  // State for form validation
  const [errors, setErrors] = useState({});
  const handleInputChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    // Email validation
    if (!userData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    }

    // Set errors if any
    setErrors(newErrors);

    // If no errors, navigate to the next page
    if (Object.keys(newErrors).length === 0) {
      try {
        await forgotPassword(userData.email);
        navigate("/login/verify", {
          state: { from: "/login" },
        });
      } catch (error) {
        setErrors({ submit: error });
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            نسيت كلمة السر
          </h2>
          <p className="text-center text-gray-500 mb-8">
            لا تقلق يحدث أحيانا أدخل بريد إلكتروني متصل بحسابك
          </p>

          <form className="space-y-6 text-right" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                البريد الإلكتروني أو رقم الموبيل
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="rtl"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="أدخل بريدك الإلكتروني أو الموبيل"
                  className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <MdOutlineEmail />
                </span>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              أرسل الكود
            </button>
          </form>
          <div className="text-right text-sm text-gray-500 mt-4">
            <div className="flex items-center space-x-2 mt-36">
              <div
                className=" mr-7 cursor-pointer"
                onClick={() => navigate(-1)}
              >
                العوده
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image and Text */}
        <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center  px-8 text-white">
          <h2 className="text-2xl font-bold mb-4 text-center mt-7">
            قم بتنزيل الفيديوهات المفضلة لديك بسهولة ومن أي رابط على الإنترنت
          </h2>
          <p className="text-2xl font-bold mb-4 text-center">
            ! املأ بياناتك الآن وابدأ في التحميل
          </p>
          <img
            src="/5.svg"
            alt="Person"
            className="rounded-lg object-cover mt-4 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
