import axios from "axios";
import Footer from "../components/Footer";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SignupContext } from "../context/SignupContext";
import toast from "react-hot-toast";
const UpdateAdsforUser = () => {
  const location = useLocation(); // Get the location object
  const navigate = useNavigate(); // Initialize the navigate function
  const selectedPackage = location.state?.package; // Access the package state
  const { userData } = useContext(SignupContext);

  const [formData, setFormData] = useState({
    user_id: userData.id,
    title: "",
    description: "",
    url: "",
    file: null, // Change to a single file
    status: "pending",
    repetitions: selectedPackage?.repate,
    budget: selectedPackage?.amount,
    duration: selectedPackage?.duration,
  });
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first file only
    if (file && file.size <= 2 * 1024 * 1024) {
      // 2MB limit
      setFormData({ ...formData, file });
      setUploadedFileName(file.name);
      setError("");
    } else {
      setError("File exceeds the 2MB limit or is not selected.");
      setUploadedFileName("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    for (const key in formData) {
      if (key === "file") {
        dataToSend.append("file", formData.file); // Append the single file
      } else {
        dataToSend.append(key, formData[key]);
      }
    }

    try {
      // const response = await axios.post('http://127.0.0.1:5000/api/service-request', dataToSend, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      // console.log('Response:', response.data);
      // Handle success (e.g., show a success message)
      const response = await axios.post(
        "https://downloadsplatform.com/api/advertisements",
        dataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("Response:", response.data);
      navigate("/", { replace: true });
    } catch (error) {
      // console.error("Error submitting form:", error);
      toast.error("فشل في تسجيل");
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <>
      <div
        className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md my-7"
        dir="rtl"
      >
        <h2 className="text-2xl font-bold mb-4">طلب خدمة جديدة</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              اسم المنتج
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              عنوان
            </label>
            <input
              type="text"
              name="description"
              onChange={handleChange}
              value={formData.description}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              اللينك
            </label>
            <input
              type="text"
              name="url"
              onChange={handleChange}
              value={formData.url}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <div className="mb-4">
              <h4 className="text-md font-semibold">الملف المرفوع:</h4>
              {uploadedFileName && <p>{uploadedFileName}</p>}
            </div>
            <h3 className="text-lg font-semibold">قم بسحب الصورة وملف هنا</h3>
            <p className="text-sm text-gray-500">JPG, PNG, GIF: الملفات تدعم</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 block w-full border border-gray-300 rounded-md p-2"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600"
          >
            التالي
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdateAdsforUser;
