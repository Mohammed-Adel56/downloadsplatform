import { useState } from 'react';
import { FiEye, FiVideo, FiImage, FiClock, FiPlay, FiLayout, FiTrash2, FiEdit } from 'react-icons/fi';

const ApiManagement = () => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const features = [
    { id: 'viewer', icon: FiEye, label: 'Viewer' },
    { id: 'igtv', icon: FiVideo, label: 'Igtv' },
    { id: 'story', icon: FiClock, label: 'Story' },
    { id: 'reel', icon: FiPlay, label: 'Reel' },
    { id: 'image', icon: FiImage, label: 'صورة' },
    { id: 'video', icon: FiVideo, label: 'فيديو' },
    { id: 'carousel', icon: FiLayout, label: 'Carousel' },
  ];

  const apiKeys = [
    {
      id: '01',
      name: 'تيك توك',
      createdDate: '15-oc-99',
      lastUsed: '15-oc-23',
      expiryDate: '18-oc-24',
    },
    // Add more API keys as needed
  ];

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API إدارة</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <span>تصدير</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* New API Key Generation */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">توليد مفتاح API جديد</h2>
        <p className="text-gray-600 mb-6">
          قم بإنشاء مفتاح API جديد للوصول إلى الموارد. تتيح لك هذه الخاصية إصدار مفاتيح مخصصة
          للمستخدمين الجدد مع إعدادات الصلاحية المرغوبة لضمان أمان الوصول.
        </p>

        {/* Feature Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                selectedFeatures.includes(feature.id)
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <feature.icon className="w-5 h-5" />
              <span>{feature.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md">
            رفع الملف
          </button>
          <button className="border px-6 py-2 rounded-md">
            إرسال الملف
          </button>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Api إدارة مفاتيح</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الرقم</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">API اسم</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ آخر استخدام</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الانتهاء</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{key.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{key.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{key.createdDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{key.lastUsed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{key.expiryDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-600">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center p-4 gap-2">
          <button className="px-3 py-1 border rounded">التالي</button>
          <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 border rounded">2</button>
          <button className="px-3 py-1 border rounded">3</button>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;