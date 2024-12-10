import { useContext, useState } from "react";
import { SignupContext } from "../context/SignupContext";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { userData, resetPassword, setUserData } = useContext(SignupContext);
  const [password, setPassword] = useState("");
  const [resetPasswordConfig, setResetPasswordConfig] = useState("");

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showOtherPassword, setShowOtherPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleChangePass = (e) => {
    setPassword(e.target.value);
  };
  const handleChangeOtherPass = (e) => {
    setResetPasswordConfig(e.target.value);
  };

  const handleShowPass = () => {
    setShowPassword(!showPassword);
  };
  const handleOtherShowPass = () => {
    setShowOtherPassword(!showOtherPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Password validation
    if (!password.length) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (password.length < 8) {
      newErrors.password = "يجب أن تكون كلمة المرور أطول من 8 أحرف";
    }
    if (password != resetPasswordConfig) {
      newErrors.resetPassword = "كلمة المرور  غير متطابقه";
    }

    // Set errors if any
    setErrors(newErrors);

    // If no errors, navigate to the next page
    if (Object.keys(newErrors).length === 0) {
      try {
        // console.log(userData.otpString);
        await resetPassword(userData.email, userData.otpString, password);
        setUserData((prevData) => ({
          ...prevData,
          password: password,
        }));
        navigate("/");
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
            إعادة تعيين كلمة السر
          </h2>
          <p className="text-center text-gray-500 mb-8">
            تعيين كلمة السر الجديدة وتمكن من الاستمتاع بالميزات الخاصة بموقعنا
          </p>

          <form className="space-y-6 text-right" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                كلمة السر الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="rtl"
                  name="password"
                  value={password}
                  onChange={handleChangePass}
                  placeholder="أدخل كلمة السر"
                  className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-3"
                  onClick={handleShowPass}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                تأكيد كلمة السر
              </label>
              <div className="relative">
                <input
                  type={showOtherPassword ? "text" : "password"}
                  dir="rtl"
                  name="password"
                  value={resetPasswordConfig}
                  onChange={handleChangeOtherPass}
                  placeholder="أدخل كلمة السر"
                  className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-3"
                  onClick={handleOtherShowPass}
                >
                  {showOtherPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </span>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            {errors.resetPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.resetPassword}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              إعادة تعين
            </button>
          </form>
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

export default ResetPassword;
