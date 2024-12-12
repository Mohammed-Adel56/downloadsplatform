import { createContext, useEffect, useState } from "react";
import { authAPI } from "../data/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getCookie = () => {
  try {
    // Create axios instance for checking auth
    const instance = axios.create({
      baseURL: "https://downloadsplatform.com",
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return instance.get("/api/auth/check-auth").then((response) => {
      // console.log("Auth check response:", response.data);

      return response.data;
    });
  } catch (error) {
    // console.error("Error checking auth:", error);
    toast.error("حدث خطاء ما");
    return null;
  }
};

export const SignupContext = createContext();

export const SignupProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    country: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const register = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register({
        email: userData.email,
        password: userData.password,
      });
      toast.success("تم إرسال الرمز  إلى البريد الإلكتروني");
      return response;
    } catch (err) {
      toast.error(error.response?.data?.message || "حدث خطأ ما");
      setError(err.response?.data?.error || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const verifyOTP = async ({ email, otp, type }) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP({ email, otp, type });
      if (response.data.user) {
        setUserData(response.data.user);
        setIsAuthenticated(true);
      }
      toast.success("تم التحقق بنجاح");
      return response.data;
    } catch (err) {
      toast.error(error.response?.data?.message || "حدث خطأ ما");
      throw err.response?.data?.error || "An error occurred";
    } finally {
      setLoading(false);
    }
  };
  const resendOTP = async (email, type = "verification") => {
    try {
      const response = await axios.post(
        "https://downloadsplatform.com/api/auth/resend-otp",
        {
          email,
          type,
        }
      );
      toast.success("تم إرسال رمز التحقق الجديد");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "فشل في إرسال رمز التحقق");
      return false;
    }
  };
  const updateUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.updateUserDetails(userData);
      toast.success("تم تحديث البيانات بنجاح");
      return response.data;
    } catch (err) {
      toast.error(error.response?.data?.message || "حدث خطأ ما");
      setError(err.response?.data?.error || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword({ email });
      toast.success("تم إرسال الرمز  إلى البريد الإلكتروني");
      return response.data;
    } catch (err) {
      toast.error(error.response?.data?.message || "حدث خطأ ما");
      throw err.response?.data?.error || "An error occurred";
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async (email, otp, newPassword) => {
    try {
      setLoading(true);
      const response = await authAPI.resetPassword({
        email,
        otp,
        new_password: newPassword,
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      return response.data;
    } catch (err) {
      toast.error(error.response?.data?.message || "فشل في تغيير كلمة المرور");
      throw err.response?.data?.error || "An error occurred";
    } finally {
      setLoading(false);
    }
  };
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://downloadsplatform.com/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, // Important for cookies
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      setIsAuthenticated(true);
      setUserData(response.data.user);

      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول");
    }
  };
  const logout = async () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      country: "",
      gender: "",
    });

    toast.success("تم تسجيل الخروج بنجاح");
  };
  const checkAuth = async () => {
    try {
      // console.log("Checking auth status...");
      // console.log("Current cookies:", getCookie("auth_token"));
      const authData = await getCookie();
      // console.log(authData.user.email);
      if (authData.user["email"] == "admin10085@outlook.com") {
        setIsAdmin(true);
      }

      // const response = await axios.get(
      //   "http://127.0.0.1:5000/api/auth/check-auth",
      //   {
      //     withCredentials: true,
      //     headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // console.log("Auth check response:", response.data);

      // if (response.data.authenticated) {
      //   setIsAuthenticated(true);
      //   setUserData(response.data.user);
      // } else {
      //   setIsAuthenticated(false);
      // }
      if (authData && authData.authenticated) {
        setIsAuthenticated(true);
        setUserData(authData.user);
      } else {
        setIsAuthenticated(false);
        setUserData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          birthDate: "",
          country: "",
          gender: "",
        });
      }
    } catch (error) {
      // console.error("Auth check error:", error);
      // toast.error("حدث خطا ما")
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <SignupContext.Provider
      value={{
        userData,
        setUserData,
        loading,
        error,
        forgotPassword,
        resetPassword,
        register,
        verifyOTP,
        updateUserDetails,
        resendOTP,
        logout,
        login,
        isAuthenticated,
        setIsAuthenticated,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};
