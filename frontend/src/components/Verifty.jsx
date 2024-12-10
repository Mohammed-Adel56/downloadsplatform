import { useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SignupContext } from "../context/SignupContext";

const Verifty = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { userData, setUserData, verifyOTP, resendOTP } =
    useContext(SignupContext);
  const location = useLocation();
  const isForgetPassword = location.state?.from === "/login";
  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await resendOTP(
        userData.email,
        isForgetPassword ? "reset" : "verification"
      );
      setErrors("");
    } catch (error) {
      setErrors("فشل في إعادة إرسال الرمز");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setErrors("الرجاء إدخال الرمز كاملاً");
      return;
    }
    setUserData((prevData) => ({
      ...prevData,
      otpString: otpString,
    }));
    // console.log(otpString);
    // console.log(userData);
    try {
      setLoading(true);
      await verifyOTP({
        email: userData.email,
        otp: otpString,
        type: isForgetPassword ? "reset" : "verification",
      });

      // Navigate based on the flow
      if (isForgetPassword) {
        navigate("/login/input", { replace: true });
      } else {
        navigate("/register/input", { replace: true });
      }
    } catch (error) {
      setErrors("رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }

    // Add your verification logic here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            أدخل كود التحقق
          </h3>
          <p className="text-center text-sm text-gray-800 mb-6">
            تحقق من الكود علي رقم الموبيل أو البريد الالكتروني
          </p>
          {errors && (
            <div className="text-red-500 text-center mb-4">{errors}</div>
          )}
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                type="text"
                maxLength={1}
                className={`
                    border border-gray-300 
                    rounded-md p-2 w-16 
                    text-center text-xl
                    transition-colors duration-200
                    ${digit ? "bg-blue-50 " : "bg-white"}
                    ${errors ? "border-red-500" : ""}
                    focus:outline-none
                  `}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>
          <p className=" text-center mb-6">
            لم تحصل علي الكود؟{" "}
            <button
              className={`text-blue-600 underline cursor-pointer ${
                loading ? "opacity-50" : ""
              }`}
              onClick={handleResendOTP}
              disabled={loading}
            >
              إعادة الإرسال
            </button>
          </p>
          <button
            className={`bg-blue-600 text-white rounded-md p-2 w-full ${
              loading ? "opacity-50" : ""
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "جاري التحقق..." : "تحقق"}
          </button>
          <div className="text-right text-sm text-gray-500 mt-4">
            <div className="flex items-center space-x-2 mt-36">
              <div
                className=" mr-7 cursor-pointer"
                onClick={() => navigate(-1)}
              >
                العوده
              </div>

              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
              <div className="w-1/4 h-1 bg-blue-500 rounded"></div>
              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
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

export default Verifty;
