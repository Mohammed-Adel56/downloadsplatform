import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./page/Home";
import Shope from "./page/Shope";
import Login from "./page/login";
import Register from "./page/Register";
import { SignupContext } from "./context/SignupContext";
import Verifty from "./components/Verifty";
import PrivateVerifyRoute from "./components/PrivateVerifyRoute";
import InputDetails from "./components/InputDetails";
import Welcome from "./components/welcome";
import ForgetPassword from "./components/ForgetPassword";
import PrivateForgetRoute from "./components/privateForgetRoute";
import ResetPassword from "./components/ResetPassword";
import toast, { Toaster } from "react-hot-toast";
import PayPage from "./page/payPage";
import Dashboard from "./page/Dashboard";
import Layout from "./components/layout/Layout";
import AdsManagement from "./page/UsersDashboard";
import AdsReview from "./page/AdsReview";
import Subscriptions from "./page/Subscriptions";
import Notifications from "./page/Notifications";
import Profile from "./page/Profile";
import ContentManagement from "./page/ContentManagement";
import ServicesStore from "./page/ServicesStore";
import ApiManagement from "./page/ApiManagement";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import UpdateAdsforUser from "./page/UpdateAdsforUser";
import AdminRoute from "./components/AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/shop",
    children: [
      {
        index: true,
        element: <Shope />,
      },
      {
        path: "package-details",
        element: <PayPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        ),
      },
      {
        path: "users",
        element: (
          <AdminRoute>
            <AdsManagement />
          </AdminRoute>
        ),
      },
      {
        path: "ads",
        element: (
          <AdminRoute>
            <AdsReview />
          </AdminRoute>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <AdminRoute>
            <Subscriptions />
          </AdminRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <AdminRoute>
            <Notifications />
          </AdminRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <AdminRoute>
            <Profile />
          </AdminRoute>
        ),
      },
      {
        path: "content",
        element: (
          <AdminRoute>
            <ContentManagement />
          </AdminRoute>
        ),
      },
      {
        path: "services",
        element: (
          <AdminRoute>
            <ServicesStore />
          </AdminRoute>
        ),
      },
      {
        path: "api",
        element: (
          <AdminRoute>
            <ApiManagement />
          </AdminRoute>
        ),
      },
    ],
  },

  {
    path: "/login",
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "forgetpassword",
        element: <ForgetPassword />,
      },
      {
        path: "verify",
        // Fixed syntax: changed = to :
        element: (
          <PrivateForgetRoute>
            <Verifty />
          </PrivateForgetRoute>
        ),
      },
      {
        path: "input",
        element: (
          <PrivateForgetRoute>
            <ResetPassword />
          </PrivateForgetRoute>
        ),
      },
    ],
  },
  {
    path: "update",

    element: (
      <PrivateVerifyRoute>
        <UpdateAdsforUser />
      </PrivateVerifyRoute>
    ),
  },
  {
    path: "/register",
    children: [
      {
        index: true,
        element: <Register />,
      },
      {
        path: "verify",
        // Fixed syntax: changed = to :
        element: (
          <PrivateVerifyRoute>
            <Verifty />
          </PrivateVerifyRoute>
        ),
      },
      {
        path: "input",
        element: (
          <PrivateVerifyRoute>
            <InputDetails />
          </PrivateVerifyRoute>
        ),
      },
      {
        path: "welcome",
        element: (
          <PrivateVerifyRoute>
            <Welcome />
          </PrivateVerifyRoute>
        ),
      },
    ],
  },
]);

function App() {
  const sessionStartRef = useRef(new Date());
  const recordedRef = useRef(false);
  const { isAuthenticated } = useContext(SignupContext);
  // console.log(isAuthenticated);
  // Get OS info
  const getOperatingSystem = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "MacOS";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    if (userAgent.indexOf("Android") !== -1) return "Android";
    if (userAgent.indexOf("iOS") !== -1) return "iOS";
    return "Other";
  };

  useEffect(() => {
    // Record session start
    // setSessionStart(new Date());
    // console.log(sessionStart);

    // Record session end when user leaves
    const recordSession = async () => {
      try {
        await axios.post("http://localhost:5000/api/session", {
          start_time: sessionStartRef.current.toISOString(),
          end_time: new Date().toISOString(),
          is_authenticated: isAuthenticated,
          operating_system: getOperatingSystem(),
        });

        recordedRef.current = true;
      } catch (error) {
        // console.error("Error recording session:", error);
        
        toast.error("فشل في تسجيل الحصة");
      }
    };
    const intervalId = setInterval(recordSession, 60000);
    // Handle page unload
    const handleUnload = () => {
      if (recordedRef.current) return;

      const data = new Blob(
        [
          JSON.stringify({
            start_time: sessionStartRef.current.toISOString(),
            end_time: new Date().toISOString(),
            is_authenticated: isAuthenticated,
            operating_system: getOperatingSystem(),
            final: true,
          }),
        ],
        { type: "application/json" }
      );

      navigator.sendBeacon("http://localhost:5000/api/session", data);
      // console.log(data);
      recordedRef.current = true;
    };
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
      recordSession();
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  return (
    <>
      <PayPalScriptProvider
        options={{
          "client-id":
            "AT7-WMO3p5uFo_78BiRcWbM0yI1dn6WmQmA-2obmZyAit9kAi_Cu5834oN-MAqlv6NVZGpSkh3IJH551",
          vault: "true",
          intent: "capture",
        }}
      >
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </PayPalScriptProvider>
    </>
  );
}

export default App;
