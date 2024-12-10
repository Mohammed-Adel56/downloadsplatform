import { useContext, useState } from "react";
import { FaFacebook, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SignupContext } from "../context/SignupContext";

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
import toast from "react-hot-toast";
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

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const microsoftProvider = new OAuthProvider("microsoft.com");
const Login = () => {
  const { userData, login, setUserData, setIsAuthenticated, setIsAdmin } =
    useContext(SignupContext);

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
        baseURL: "http://127.0.0.1:5000",
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const response = await axiosInstance.post("/api/auth/social-login", {
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      });

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
      setAuthError(error.message);
    }
  };

  // State for form validation
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const handleInputChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleShowPass = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    // Email validation
    if (!userData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    }

    // Password validation
    if (!userData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }
    // Set errors if any
    setErrors(newErrors);

    // If no errors, navigate to the next page
    if (Object.keys(newErrors).length === 0) {
      if (
        userData.email === emailAdmin &&
        userData.password === passwordAdmin
      ) {
        // console.log("********************");
        try {
          const response = await axios.post(
            "http://localhost:5000/api/auth/login",
            {
              email: emailAdmin,
              password: passwordAdmin,
              isAdmin: true, // Hardcoded to true for admin registration
            },
            { withCredentials: true }
          );
          if (response.data.success) {
            setIsAdmin(true);
            setIsAuthenticated(true);
            navigate("/dashboard"); // Redirect to dashboard
          }
        } catch (error) {
          // console.error("Registration error:", error);
          toast.error(error.message);
        }
      } else {
        await login(userData.email, userData.password);
        navigate("/");
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            تسجيل الدخول
          </h2>
          <p className="text-center text-gray-500 mb-8">
            أدخل البريد الإلكتروني و اختر كلمة السر
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

            <div>
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
              <p
                className="text-right text-sm text-gray-500 underline mt-2 cursor-pointer"
                onClick={() => navigate("/login/forgetpassword")}
              >
                نسيت كلمة السر؟
              </p>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              سجل الدخول
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6 flex flex-col ">
            <span className="font-bold mb-2 text-lg text-gray-800">
              تسجيل الدخول
            </span>
          </div>

          <div className="flex  items-center ">
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

export default Login;
