import { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
const ServicesStore = () => {
  const [services, setServices] = useState([]);
  const [image, setImage] = useState(null); // State to hold the image file

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    duration: "يوم",
    repetitions: "",
    price: "",
    image_url: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categoriesData = [
    {
      id: 1,
      title: "فيديو ترويجي",
      type: "فيديو - اشعار خاص يجب المستخدمين ان",
      description: "فيديو - اشعار خاص يجب المستخدمين ان",
      duration: "3 دقائق",
      repetitions: "10 تكرارات",
      price: "100 ريال",
    },
    // Add more categories as needed
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services");
      setServices(response.data.services);
      // console.log(services);
    } catch (error) {
      // console.error("Error fetching services:", error);
      toast.error("فشل في تحميل الخدمات")
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadResponse = await axios.post(
          "http://localhost:5000/api/upload-image",
          formData
        );
        imageUrl = uploadResponse.data.url; // Get the uploaded image URL
      }
      // console.log(imageUrl);

      const serviceData = { ...formData, image_url: imageUrl }; // Add image_url to the service data
      if (isEditing) {
        // console.log(formData);
        await axios.put(
          `http://localhost:5000/api/services/${editingId}`,
          serviceData
        );
      } else {
        // console.log(formData);
        await axios.post("http://localhost:5000/api/services", serviceData);
      }
      fetchServices();
      resetForm();
    } catch (error) {
      // console.error("Error saving service:", error);
      toast.error("فشل في حفظ الخدمه");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`);
        fetchServices();
      } catch (error) {
        // console.error("Error deleting service:", error);
        toast.error("فشل في حذف الخدمه")
      }
    }
  };

  const handleEdit = (service) => {
    setFormData({
      title: service.title,
      type: service.type,
      description: service.description,
      duration: service.duration,
      repetitions: service.repetitions,
      price: service.price,
    });
    setIsEditing(true);
    setEditingId(service.id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      description: "",
      duration: "",
      repetitions: "",
      price: "",
      image_url: "",
    });
    setImage(null);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">متجر الخدمات</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <span>تصدير</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>

      {/* Add New Category Form */}
      <form
        className="bg-white rounded-lg shadow-sm p-6 mb-8"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold mb-6">إضافة فئة جديدة</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Category Name */}
          <div>
            <label className="block text-gray-700 mb-2">اسم الفئة</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="أدخل اسم الفئة"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Category Type */}
          <div>
            <label className="block text-gray-700 mb-2">نوع الفئة</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="أدخل نوع الفئة"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">الوصف</label>
          <textarea
            className="w-full p-2 border rounded-md h-32"
            placeholder="اكتب وصف الفئة هنا..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Ad Duration */}
          <div>
            <label className="block text-gray-700 mb-2">مدة الإعلان</label>
            <div className="flex gap-2">
              <select
                className="p-2 border rounded-md"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              >
                <option value="يوم">يوم</option>
                <option value="أسبوع">أسبوع</option>
                <option value="شهر">شهر</option>
              </select>
            </div>
          </div>

          {/* Number of Repetitions */}
          <div>
            <label className="block text-gray-700 mb-2">عدد التكرارات</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="أدخل عدد التكرارات"
              value={formData.repetitions}
              onChange={(e) =>
                setFormData({ ...formData, repetitions: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-gray-700 mb-2">سعر المنتج</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="السعر"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
        </div>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
          type="submit"
        >
          {isEditing ? "تحديث الخدمة" : "إضافة خدمة جديدة"}
        </button>
      </form>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold">إدارة الفئات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  عنوان الفئة
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  نوع الفئة
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  مدة الإعلان
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  عدد التكرارات
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  سعر المنتج
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.duration}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.repetitions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleEdit(category)}
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-500 hover:text-red-600"
                        onClick={() => handleDelete(category.id)}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicesStore;
