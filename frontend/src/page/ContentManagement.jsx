import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiSettings } from "react-icons/fi";

const ContentManagement = () => {
  const [contentList, setContentList] = useState([]);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editContentId, setEditContentId] = useState(null);

  // Fetch content from the backend
  const fetchContent = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/content");
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();
      setContentList(data.content);
    } catch (error) {
      // console.error("Error fetching content:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Handle adding or updating content
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:5000/api/content/${editContentId}`
        : "http://localhost:5000/api/content";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });
      if (!response.ok) throw new Error("Failed to save content");
      setNewContent({ title: "", description: "", type: "" });
      setIsEditing(false);
      setEditContentId(null);
      fetchContent(); // Refresh content list
    } catch (error) {
      // console.error("Error saving content:", error);
      toast.error(error);
    }
  };

  // Handle editing content
  const handleEdit = (content) => {
    setNewContent({
      title: content.title,
      description: content.description,
      type: content.type,
    });
    setIsEditing(true);
    setEditContentId(content.id);
  };

  // Handle deleting content
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/content/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete content");
      fetchContent(); // Refresh content list
    } catch (error) {
      // console.error("Error deleting content:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Content Management Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 mb-8"
      >
        <h2 className="text-xl font-semibold">
          {isEditing ? "تعديل المحتوى" : "إضافة محتوى"}
        </h2>
        <input
          type="text"
          placeholder="العنوان"
          value={newContent.title}
          onChange={(e) =>
            setNewContent({ ...newContent, title: e.target.value })
          }
          required
          className="border rounded-md p-2 mb-4 w-full"
        />
        <textarea
          placeholder="الوصف"
          value={newContent.description}
          onChange={(e) =>
            setNewContent({ ...newContent, description: e.target.value })
          }
          required
          className="border rounded-md p-2 mb-4 w-full"
        />
        <select
          value={newContent.type}
          onChange={(e) =>
            setNewContent({ ...newContent, type: e.target.value })
          }
          required
          className="border rounded-md p-2 mb-4 w-full"
        >
          <option value="">اختر نوع المحتوى</option>
          <option value="feature">مميزات</option>
          <option value="faq"> اسئله </option>
          <option value="how"> كيف تعمل </option>
          {/* Add more options as needed */}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          {isEditing ? "تحديث المحتوى" : "إضافة المحتوى"}
        </button>
      </form>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">قائمة المحتوى</h2>
        {contentList.length === 0 ? (
          <p className="text-gray-600">لا يوجد محتوى متاح.</p>
        ) : (
          contentList.map((content) => (
            <div
              key={content.id}
              className="flex justify-between items-center mb-4"
            >
              <div>
                <h3 className="font-bold">{content.title}</h3>
                <p className="text-gray-600">{content.description}</p>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(content)}
                  className="text-blue-500 mr-2"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(content.id)}
                  className="text-red-500"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentManagement;
