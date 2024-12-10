import { useContext } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SignupContext } from "../context/SignupContext";
import toast from "react-hot-toast";
const PaypalButtonsComponent = ({ amount, type, replate, duration }) => {
  const navigate = useNavigate();
  const { userData, isAuthenticated } = useContext(SignupContext);
  const createOrder = async (data, actions) => {
    if (isAuthenticated) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amount,
              currency_code: "USD",
            },
          },
        ],
      });
    } else {
      toast.error("يجب ان تسجل الدخول اولا");
    }
  };
  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async function (details) {
      // Send the details to your server for validation and database update
      try {
        // console.log(data);

        const response = await axios.post(
          "http://127.0.0.1:5000/api/execute-payment",
          {
            orderID: data.orderID,
            payerID: data.payerID,
            paymentDetails: details,
            email: userData.email,
            type: type,
            tier: replate,
          }
        );

        // console.log("Payment executed successfully:", response.data);
        toast.success("Payment executed successfully");

        // Redirect to the private route after successful payment and subscription creation
        if (response.data.success) {
          navigate("/update", {
            state: {
              package: {
                type: type,
                repate: replate,
                amount: amount,
                duration: duration,
              },
            },
          }); // Change to your desired route
        }
      } catch (error) {
        if (error.response) {
          // console.error("Error data:", error.response.data);
          // console.error("Error status:", error.response.status);
          toast.error(error.response.data);
        } else {
          // console.error("Error:", error.message);
          toast.error(error.message);
        }
      }
    });
  };

  return (
    <div>
      <PayPalButtons
        style={{ shape: "pill", layout: "vertical", color: "blue" }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </div>
  );
};

export default PaypalButtonsComponent;
