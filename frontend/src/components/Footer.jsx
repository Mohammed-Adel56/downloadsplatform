import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-50 py-8 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
        {/* Left Section - Download Links and QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-2">
            <a href="#" className="block">
              <img src="/public/Mobile1.png" alt="App Store" className="w-32" />
            </a>
            <a href="#" className="block">
              <img
                src="/public/Mobile3.png"
                alt="Google Play"
                className="w-32"
              />
            </a>
            <a href="#" className="block">
              <img
                src="/public/Mobile2.png"
                alt="AppGallery"
                className="w-32"
              />
            </a>
          </div>
          <img src="/public/QR_Code.png" alt="QR Code" className="w-20 h-20" />
        </div>

        {/* Center Section - Contact Info and Button */}
        <div className="text-right space-y-4">
          <h3 className="font-semibold">تواصل معنا</h3>
          <p className="text-gray-600">
            download-platform@company.com
            <br />
            <br />
            (141) 687-5892
          </p>
          <div className="bg-gray-600 rounded-md shadow-md py-2 px-2 flex items-center justify-around">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              اضغط هنا
            </button>
            <input
              type="text"
              className="text-right p-2 mx-1 bg-gray-600 border-none outline-none text-white"
              placeholder="تواصل معنا"
            />
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <a href="#" className="text-gray-500 hover:text-gray-700" alt="">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700" alt="">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700" alt="">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Right Section - Links */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold">روابط</h3>
          <ul className="text-gray-600 space-y-1">
            <li>
              <a href="#">الرئيسية</a>
            </li>
            <li>
              <a href="#">أهم الميزات</a>
            </li>
            <li>
              <a href="#">كيف يعمل موقعنا</a>
            </li>
            <li>
              <a href="#">الأسئلة الشائعة</a>
            </li>
            <li>
              <a href="#">التطبيق</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
