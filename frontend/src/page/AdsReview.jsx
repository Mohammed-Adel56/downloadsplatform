import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { SignupContext } from "../context/SignupContext";
import EditAdModal from "../components/EditAdModal";
import toast from "react-hot-toast";

const AdsReview = () => {
  const [ads, setAds] = useState([]);
  const { userData, isAdmin } = useContext(SignupContext);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch advertisements from the backend
    const fetchAds = async () => {
      const response = await axios.get(
        "https://downloadsplatform.com/api/advertisements",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // console.log(response);
      setAds(response.data.advertisements);
      // console.log(ads);
    };
    fetchAds();
  }, []);
  const updateAdStatus = async (adId, status) => {
    try {
      await axios.put(
        `https://downloadsplatform.com/api/advertisements/${adId}/status`,
        { status },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // Refresh the ads list after updating
      const updatedAds = ads.map((ad) =>
        ad.id === adId ? { ...ad, status } : ad
      );
      setAds(updatedAds);
    } catch (error) {
      // console.error("Error updating advertisement status:", error);
      toast.error(error.message);
    }
  };
  const openEditModal = (ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const handleUpdate = (updatedAd) => {
    setAds((prevAds) =>
      prevAds.map((ad) => (ad.id === updatedAd.id ? updatedAd : ad))
    );
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة إعلانات المستخدمين</h1>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {/* Placeholder for ad image */}
              <div className="flex items-center justify-center">
                <img
                  src={`../${ad.image_url}`}
                  alt="Ads Image"
                  className="w-42 h-42 object-cover"
                />
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{ad.title}</h2>
              <p className="text-gray-600 mb-4">{ad.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 mb-1">الحاله:</p>
                  <p className="font-medium">{ad.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">الميزانية:</p>
                  <p className="font-medium">{ad.budget}</p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">المدة الإعلانية:</p>
                  <p className="font-medium">{ad.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">الرابط :</p>
                  <p className="font-medium">{ad.url}</p>
                </div>
              </div>
              {isAdmin ? (
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={() => updateAdStatus(ad.id, "active")}
                  >
                    قبول
                  </button>
                  <button
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition-colors"
                    onClick={() => updateAdStatus(ad.id, "rejected")}
                  >
                    رفض
                  </button>
                </div>
              ) : (
                <>
                  {ad.status == "active" ? (
                    <div className=" px-4 py-3 bg-[#01ae1b] text-white font-bold w-28 rounded-lg text-center">
                      تم القبول
                    </div>
                  ) : ad.status == "reject" ? (
                    <div className="flex gap-7 flex-col md:flex-row">
                      <div className=" px-4 py-3 bg-[#fc3636] text-white font-bold w-28 rounded-lg text-center">
                        تم الرفض
                      </div>
                      <button
                        className="px-4 py-3 border border-gray-300 text-gray-700  rounded-lg text-center hover:bg-gray-50 transition-colors"
                        onClick={() => openEditModal(ad)}
                      >
                        تعديل
                      </button>
                    </div>
                  ) : (
                    <div className=" px-4 py-3 border border-gray-300 text-gray-700   font-bold w-28 rounded-lg text-center">
                      {" "}
                      انتظار{" "}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Edit Advertisement Modal */}
      <div className="w-full h-full">
        <EditAdModal
          isOpen={isModalOpen}
          onClose={closeEditModal}
          ad={selectedAd}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default AdsReview;
