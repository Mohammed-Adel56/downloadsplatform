import { useState, useEffect } from "react";
import toast from "react-hot-toast";
function Features() {
  const [features, setFeatures] = useState([]);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(
        "https://downloadsplatform.com/api/content?type=feature"
      );
      const data = await response.json();
      setFeatures(data.content);
    } catch (error) {
      // console.error("Error fetching features:", error);
      toast.error("فشل في تحميل مميزات")
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return (
    <section className="py-20 text-center bg-white">
      <h2 className="text-3xl font-bold mb-6">
        ميزات تجعل تجربة التحميل أسهل وأسرع
      </h2>
      <p className="font-medium my-5 text-[#4C5A5C]">
        استمتع بخدمات تحميل متكاملة تلبي احتياجاتك المختلفة بسهولة وأمان
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 " dir="rtl">
        {/* Map over features list */}
        {features.map((feature) => (
          <div
            className="bg-gray-100 p-4 rounded-md shadow-md "
            key={feature.id}
          >
            <div className="flex items-center justify-start">
                <div className=" text-white rounded-full p-2 mr-3">
                  <img src="/1.png" alt="features" />
                </div>
              <h2 className="text-xl font-bold"> {feature.title} </h2>
            </div>
            <p className="mt-3 text-gray-600 text-right">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
