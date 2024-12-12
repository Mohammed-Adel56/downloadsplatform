import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(
        "https://downloadsplatform.com/api/content?type=faq"
      );
      const data = await response.json();
      setFaqs(data.content);
    } catch (error) {
      // console.error("Error fetching FAQs:", error);
      toast.error("فشل في تحميل الأسئلة الشائعة");
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4 my-3">
        الأسئلة الشائعة
      </h2>
      <p className="text-center text-gray-600 mb-8 w-[50%] mx-auto">
        ستجد إجابات سريعة ومباشرة لأبرز الأسئلة التي قد تخطر ببالك حول كيفية
        استخدام الموقع وخدمات التحميل المتاحة
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2  gap-4 ">
        {faqs.map((item) => (
          <div
            key={item.id}
            className={`border ${
              openIndex === item.id ? "border-gray-200" : "border-transparent"
            } rounded-lg transition-all duration-300`}
          >
            <button
              onClick={() => toggleAnswer(item.id)}
              className="flex justify-end items-center w-full p-4 text-right text-gray-700 font-semibold focus:outline-none"
            >
              <span>{item.title}</span>
              <span className="text-blue-500 text-xl mx-3">
                {openIndex === item.id ? "−" : "+"}
              </span>
            </button>
            {openIndex === item.id && (
              <div className="p-4 text-gray-600 text-right  border-t border-gray-200">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
