import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
const Packages = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [services, setServices] = useState([]); // State to hold services
  useEffect(() => {
    fetchServices(); // Fetch services on component mount
    // console.log(services);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("https://downloadsplatform.com/api/services");
      setServices(response.data.services); // Set services state
      // console.log(services);
    } catch (error) {
      // console.error("Error fetching services:", error);
      toast.error("فشل في تحميل الخدمات ");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };
  const handleMoreClick = (slide) => {
    navigate("/shop/package-details", { state: { package: slide } });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Title Section */}
      <div className="text-right mb-12">
        <h1 className="text-3xl font-bold mb-4">الفئات المتاحة</h1>
        <p className="text-gray-600  float-end mb-3 ">
          اختر الفئة التي تناسب احتياجاتك الإعلانية للوصول إلى جمهورك بشكل فعال.
          نوفر مجموعة متنوعة من الخدمات الإعلانية، بداية من الإعلانات المرئية
          والصوتية وصولاً إلى الإعلانات المصورة والخدمات المخصصة لتلبية متطلبات
          نشاطك التجاري.
        </p>
      </div>
      <div className="clear-both"></div>

      {/* Carousel */}
      <div className="relative max-w-6xl mx-auto">
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${currentSlide * -33.33}%)` }}
            >
              {services.map((slide) => (
                <div key={slide.id} className="w-1/3 flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={slide.image_url}
                      // src="/uploads/468500632_545450411727911_7240195748249618934_n.jpg"
                      alt={slide.title}
                      className="w-42 h-42 object-cover"
                    />
                    <div className="p-6 text-right">
                      <h3 className="text-xl font-bold mb-4">{slide.title}</h3>
                      <div className="space-y-3">
                        <p>
                          <span className="font-bold ml-2">نوع الفئه</span>
                          {slide.type}
                        </p>
                        <p>
                          <span className="font-bold ml-2">المدة</span>
                          {slide.duration}
                        </p>
                        <p>
                          <span className="font-bold ml-2">التكرارات</span>
                          {slide.repetitions}
                        </p>
                        <p>
                          <span className="font-bold ml-2"> سعر المنتج</span>
                          {slide.price}
                        </p>
                      </div>
                      <button
                        className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg mt-6 hover:bg-blue-600"
                        onClick={() => handleMoreClick(slide)}
                      >
                        المزيد
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Packages;
