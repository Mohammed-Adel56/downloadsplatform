import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const EditAdModal = ({ isOpen, onClose, ad, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    budget: "",
    repetitions: "",
    image_url: "",
    duration: "",
    status: "pending",
  });
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const nav=useNavigate();
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
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title,
        description: ad.description,
        url: ad.url,
        budget: ad.budget,
        repetitions: ad.repetitions,
        image_url: ad.image_url,
        duration: ad.duration,
        status: ad.status,
      });
      setUploadedFileName(ad.image_url);
    }
  }, [ad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
      const response = await axios.put(
        `https://downloadsplatform.com/api/advertisements/${ad.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      onUpdate(response.data); // Call the onUpdate function passed as a prop
      nav("/");
      onClose(); // Close the modal
    } catch (error) {
      // console.error("Error updating advertisement:", error);
      toast.error("فشل عمل تحديث الاعلان")
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg p-6 w-5/12">
        <h2 className="text-xl font-semibold mb-4">تعديل الاعلان</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">اسم المنتج</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">عنوان</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">الرابط</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="border rounded w-full py-2 px-3"
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

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
            >
              الغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              احفظ التغير
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdModal;
