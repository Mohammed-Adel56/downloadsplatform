import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            مرحبا بك
          </h2>
          <p className="text-center text-gray-500 mb-8">
            استمتع بتجربة تحميل سلسة ومتنوعة من خلال موقعنا
          </p>

          <div className="space-y-6 text-right">
            <img src="/6.svg" alt="person" className="w-full" />

            <button
              onClick={() => navigate("/")}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              ابداء الآن
            </button>
            <div className="text-right text-sm text-gray-500 mt-4">
              <div className="flex items-center space-x-2 mt-10">
                <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-1 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image and Text */}
        <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center    text-white">
          <h2 className="text-2xl font-bold mb-4 text-center mt-7 px-4">
            قم بتنزيل الفيديوهات المفضلة لديك بسهولة ومن أي رابط على الإنترنت
          </h2>
          <p className="text-2xl font-bold mb-4 text-center px-4">
            ! املأ بياناتك الآن وابدأ في التحميل
          </p>
          <img
            src="/5.svg"
            alt="Person"
            className="rounded-lg object-cover   mt-4 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
