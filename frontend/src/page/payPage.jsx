import Footer from "../components/Footer";
import Header from "../components/Header";

import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation
import PaypalButtonsComponent from "../components/PaypalButtonsComponent";
import toast from "react-hot-toast";

const PayPage = ({ onClose }) => {
  const location = useLocation(); // Get the location object
  const selectedPackage = location.state?.package; // Access the package state
  const navigate = useNavigate(); // Initialize the navigate function

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            description: selectedPackage?.title || "Your Service Package",
            amount: {
              currency_code: "USD",
              value: selectedPackage?.price || "100.00", // Replace with your actual price
            },
          },
        ],
      })
      .then((orderId) => {
        return orderId; // Return the order ID
      });
  };
  // console.log(selectedPackage);

  // Add function to handle approval
  const onApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      // Handle successful payment here
      // console.log("Payment completed successfully", details);
      toast.success("Payment Completed Successfully");
      // You can make an API call here to your backend to save the order
      navigate("/"); // Redirect to success page      navigate("/payment-success"); // Change this to your desired route
    });
  };
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col items-center ">
        {/* Header */}
        <div className="text-right mb-8">
          <h1 className="text-2xl font-bold mb-4">إتمام الشراء</h1>
          <p className="text-gray-600">
            راجع معلومات الدفع الخاصة بك وأكمل عملية الشراء. اختر طريقة الدفع
            المناسبة لتفعيل الخدمة المطلوبة.
          </p>
        </div>

        {/* Service Details Form */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold mb-6 text-right">
            تفاصيل مراجعة الخدمة
          </h2>
          <h2 className="text-xl font-bold mb-6 text-center">
            {selectedPackage?.title}
          </h2>
          <p className="my-10 text-center">{selectedPackage?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Right Column */}
            <div className="space-y-4"></div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-right mb-2">نوع الفئة</label>
                <div className="text-right font-bold text-xl">
                  {selectedPackage?.type}
                </div>
              </div>
              <div>
                <label className="block text-right mb-2">عدد التكرارات</label>
                <div className="text-right font-bold text-xl">
                  {selectedPackage?.repetitions}
                </div>
              </div>
            </div>

            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-right mb-2">المدة الزمنية</label>
                <div className="text-right font-bold text-xl">
                  {selectedPackage?.duration}
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mt-6 ">
            <p className="text-xl font-bold">
              {"$"} سعر المنتج : {selectedPackage?.price}
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold mb-6 text-center">
            طرق الدفع المتاحة
          </h2>
          <p className="text-gray-600 text-center mb-6">
            راجع معلومات الدفع الخاصة بك وأكمل عملية الشراء. اختر طريقة الدفع
            المناسبة لتفعيل الخدمة المطلوبة.
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <PaypalButtonsComponent
              amount={selectedPackage?.price}
              type={selectedPackage?.type}
              replate={selectedPackage?.repetitions}
              duration={selectedPackage?.duration}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PayPage;
