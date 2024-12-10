function AppDownload() {
  return (
    <div className="bg-blue-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">حمل تطبيقنا المجاني الأن</h1>
      <h2 className="text-xl font-medium mb-8">واستمتع بتجربة مميزة</h2>
      <p className="text-lg mb-10 w-[45%] mx-auto text-gray-500">
        اجعل تجربتك أفضل من خلال تحميل تطبيقنا على جهازك المحمول. صمم التطبيق
        ليكون سريعاً وسهل الاستخدام، مما يتيح لك الوصول إلى ميزات الموقع كاملة
      </p>
      <div className="flex justify-around gap-5 flex-col md:flex-row">
        <div className="flex items-start border border-gray-200 rounded-lg p-4 bg-white shadow-md max-w-xs">
          {/* Left Section */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">Mobile/Tablet</p>
            <h2 className="text-lg font-semibold">iOS</h2>
            <p className="text-sm  mt-1">
              Minimum Requirements Requires
              <br />
              iOS 12.0 or newer
            </p>

            {/* App Store Button */}
            <a
              href="#"
              className="inline-block mt-4"
              aria-label="Download on the App Store"
            >
              <img
                src="/Mobile1.png"
                alt="Download on the App Store"
                className="w-24"
              />
            </a>
          </div>

          {/* Right Section - QR Code */}
          <div className="ml-4 ">
            <img
              src="/scan_me_qr_code 1.png" // Replace with actual QR code image URL
              alt="QR Code"
              className="w-16 h-16"
            />
          </div>
        </div>
        <div className="flex items-start border border-gray-200 rounded-lg p-4 bg-white shadow-md max-w-xs">
          {/* Left Section */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">Mobile/Tablet</p>
            <h2 className="text-lg font-semibold">Android</h2>
            <p className="text-sm  mt-1">
              Minimum Requirements Requires
              <br />
              iOS 12.0 or newer
            </p>

            {/* App Store Button */}
            <a
              href="#"
              className="inline-block mt-4"
              aria-label="Download on the App Store"
            >
              <img
                src="/Mobile3.png"
                alt="Download on the App Store"
                className="w-24"
              />
            </a>
          </div>

          {/* Right Section - QR Code */}
          <div className="ml-4">
            <img
              src="/scan_me_qr_code 1.png" // Replace with actual QR code image URL
              alt="QR Code"
              className="w-16 h-16"
            />
          </div>
        </div>
        <div className="flex items-start border border-gray-200 rounded-lg p-4 bg-white shadow-md max-w-xs">
          {/* Left Section */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">Mobile/Tablet</p>
            <h2 className="text-lg font-semibold">Huawei</h2>
            <p className="text-sm  mt-1">
              Minimum Requirements Requires
              <br />
              iOS 12.0 or newer
            </p>

            {/* App Store Button */}
            <a
              href="#"
              className="inline-block mt-4"
              aria-label="Download on the App Store"
            >
              <img
                src="/Mobile2.png"
                alt="Download on the App Store"
                className="w-24"
              />
            </a>
          </div>

          {/* Right Section - QR Code */}
          <div className="ml-4">
            <img
              src="/scan_me_qr_code 1.png" // Replace with actual QR code image URL
              alt="QR Code"
              className="w-16 h-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDownload;
