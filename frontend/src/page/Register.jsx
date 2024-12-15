import { FaFacebook, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { SignupContext } from "../context/SignupContext";
import { useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyCK82GNopPkVk8HW184wRjcp4QK0JgyEsI",
  authDomain: "downloader-874df.firebaseapp.com",
  projectId: "downloader-874df",
  storageBucket: "downloader-874df.firebasestorage.app",
  messagingSenderId: "714082612352",
  appId: "1:714082612352:web:7b36fa4569d40108eda265",
  measurementId: "G-CKHMDEDC3J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.settings.appVerificationDisabledForTesting = true;
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const microsoftProvider = new OAuthProvider("microsoft.com");
const Register = () => {
  const {
    userData,
    setUserData,
    register,
    login,
    error,
    setIsAuthenticated,
    setIsAdmin,
  } = useContext(SignupContext);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [authError, setAuthError] = useState(null);
  const emailAdmin = "admin10085@outlook.com";
  const passwordAdmin =
    "WQ^y!HfpuUsYoED!P6Sa3cAAW%bZtTxZ&82zs$@RzT%dPfh$oGVL&i3CWV2%9B#H";
  const handleSocialSignIn = async (provider) => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      // console.log(user);
      const axiosInstance = axios.create({
        baseURL: "https://downloadsplatform.com",
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // console.log(user.displayName?.split(" ")[0]);
      const response = await axiosInstance.post("/api/auth/social-login", {
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      });
      // console.log(response);

      // You can access the user's info through result.user

      if (response.data.token) {
        setUserData({
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        });
        setIsAuthenticated(true);
        // Handle successful login
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      }
      // You can access the user's info through result.user
      // console.log("Signed in user:", result.user);
      // navigate("/");
    } catch (error) {
      // console.error("Auth error:", error);
      // console.error("Auth error:", error);
      toast.error(error.message || "حدث خطأ في تسجيل الدخول");
      setAuthError(error.message);
      // setAuthError(error.message);
    }
  };

  // State for form validation
  const [errors, setErrors] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShowPass = () => {
    setShowPassword(!showPassword);
  };

  // Update data
  const handleInputChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Handle checkbox change

  // Form submission with validation
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Email validation
    if (!userData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!isValidEmail(userData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    // Password validation
    if (!userData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (userData.password.length < 8) {
      newErrors.password = "يجب أن تكون كلمة المرور أطول من 8 أحرف";
    }

    // Checkbox validation
    if (!isChecked) {
      newErrors.checkbox = "يجب الموافقة على اتفاقية المستخدم وسياسة الخصوصية";
    }

    // Set errors if any
    setErrors(newErrors);

    // If no errors, navigate to the next page
    if (Object.keys(newErrors).length === 0) {
      // console.log(userData);
      if (
        userData.email === emailAdmin &&
        userData.password === passwordAdmin
      ) {
        try {
          const response = await axios.post(
            "https://downloadsplatform.com/api/auth/register",
            {
              email: emailAdmin,
              password: passwordAdmin,
              isAdmin: true, // Hardcoded to true for admin registration
            },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          if (response.data.success) {
            setIsAdmin(true);
            setIsAuthenticated(true);
            navigate("/dashboard"); // Redirect to dashboard
          }
        } catch (error) {
          // console.error("Registration error:", error);
          toast.error("فشل في التسجيل");
        }
      } else {
        try {
          setLoading(true);
          await register();
          toast.success("تم التسجيل بنجاح");
          navigate("/register/verify", {
            state: { from: "/register" },
          });
        } catch (err) {
          if (err.response?.status === 409) {
            toast.error("البريد الإلكتروني مسجل بالفعل");
            setErrors({
              email: "البريد الإلكتروني مسجل بالفعل",
            });
          } else {
            toast.error(err.response?.data?.message || "حدث خطأ أثناء التسجيل");
            setErrors({
              submit: err.response?.data?.message || "فشل في التسجيل",
            });
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 p-8">
          <h1 className="text-3xl font-semibold text-blue-700 mb-8 text-center">
            Downloads<span className="text-black">-platform</span>
          </h1>
          <h2 className="text-xl font-semibold mb-6 text-right">
            إنشاء حساب جديد
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="text-red-500 text-sm text-right">
                {errors.submit}
              </div>
            )}
            <div className="text-right">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                البريد الالكتروني أو رقم الموبيل
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

            <div className="text-right">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                كلمة السر
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="rtl"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
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

            <div className="flex items-center justify-end">
              <label className="mr-2 block text-sm text-gray-700">
                أوافق على اتفاقية المستخدم وسياسة الخصوصية
              </label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            {errors.checkbox && (
              <p className="text-red-500 text-sm text-right mt-1">
                {errors.checkbox}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "جاري التسجيل..." : "التالي"}
            </button>
          </form>
          <div className="flex  items-center my-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-500">أو</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex justify-center mt-4 space-x-3 text-gray-600">
            <button onClick={() => handleSocialSignIn(googleProvider)}>
              <FcGoogle size={25} />
            </button>
            <button onClick={() => handleSocialSignIn(facebookProvider)}>
              <FaFacebook color="blue" size={25} />
            </button>
            <button>
              <img
                onClick={() => handleSocialSignIn(microsoftProvider)}
                src="/Microsoft_Logo.svg"
                alt="microsoft"
                className="w-[20px]"
              />
            </button>
          </div>
          <div className="text-right text-sm text-gray-500 mt-4">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-blue-600">
              أدخل
            </Link>
            <div className="flex space-x-2 mt-3">
              <div className="w-1/4 h-1 bg-blue-500 rounded"></div>
              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
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

export default Register;
