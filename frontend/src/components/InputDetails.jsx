import { useContext, useEffect, useState } from "react";
import { SignupContext } from "../context/SignupContext";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import countriesData from "../data/countries.json";

const InputDetails = () => {
  const { userData, setUserData, updateUserDetails } =
    useContext(SignupContext);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const customStyles = {
    control: (base) => ({
      ...base,
      textAlign: "right",
      direction: "rtl",
      borderColor: "#3B82F6",
      color: "white",
      "&:hover": {
        borderColor: "#2563EB", // Tailwind blue-600
      },
    }),

    placeholder: (base) => ({
      ...base,
      color: "black", // Tailwind gray-400
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "black",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      textAlign: "right",
    }),
    menu: (base) => ({
      ...base,
      textAlign: "right",
    }),
    singleValue: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
    option: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
  };

  const formatOptionLabel = ({ label, flag }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span>{flag}</span>
      <span>{label}</span>
    </div>
  );

  const handleInputChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Email validation
    // First Name validation
    if (!userData.firstName) {
      newErrors.firstName = "الاسم الأول مطلوب";
    } else if (userData.firstName.length < 2) {
      newErrors.firstName = "الاسم الأول يجب أن يكون أكثر من حرفين";
    }

    // Last Name validation
    if (!userData.lastName) {
      newErrors.lastName = "الاسم الأخير مطلوب";
    } else if (userData.lastName.length < 2) {
      newErrors.lastName = "الاسم الأخير يجب أن يكون أكثر من حرفين";
    }
    // Birth Date validation
    if (!userData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    } else {
      const birthDate = new Date(userData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.birthDate = "يجب أن يكون عمرك أكبر من 13 سنة";
      }
    }
    // Country validation
    if (!userData.country) {
      newErrors.country = "الدولة مطلوبة";
    }
    // Gender validation
    if (!userData.gender) {
      newErrors.gender = "الجنس مطلوب";
    }

    // Password validation

    // Set errors if any
    setErrors(newErrors);

    // If no errors, navigate to the next page
    if (Object.keys(newErrors).length === 0) {
      try {
        await updateUserDetails(userData);
        navigate("/register/welcome");
      } catch (error) {
        setErrors({ submit: error });
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white flex flex-wrap w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">أكمل بياناتك</h2>
          <p className="text-gray-600 mb-6 text-center">
            احصل علي أسبوع كامل بدون إعلانات بإكمال البيانات
          </p>
          <div className="mb-4 text-right">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-bold mb-2"
            >
              الاسم الأول
            </label>
            <input
              type="text"
              id="firstName"
              dir="rtl"
              placeholder="أدخل الاسم"
              name="firstName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userData.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-bold mb-2"
            >
              الاسم الأخير
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              dir="rtl"
              placeholder="أدخل الاسم"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <label
              htmlFor="birthDate"
              className="block text-gray-700 font-bold mb-2"
            >
              تاريخ الميلاد
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userData.birthDate}
              onChange={handleInputChange}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <label
              htmlFor="country"
              className="block text-gray-700 font-bold mb-2"
            >
              الدولة
            </label>
            {/* <input
              type="text"
              id="country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            /> */}
            <Select
              styles={customStyles}
              options={countriesData}
              value={selectedCountry}
              onChange={(selectedOption) => {
                setSelectedCountry(selectedOption);
                setUserData((prevData) => ({
                  ...prevData,
                  country: selectedOption.label,
                }));
              }}
              formatOptionLabel={formatOptionLabel}
              isRtl={true}
              placeholder="اختر الدولة"
              noOptionsMessage={() => "لا توجد خيارات"} // Add Arabic message
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <label
              htmlFor="gender"
              className="block text-gray-700 font-bold mb-2"
            >
              الجنس
            </label>
            <select
              id="gender"
              name="gender"
              dir="rtl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userData.gender}
              onChange={handleInputChange}
            >
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>
          <button
            className="bg-blue-600 text-white rounded-md p-2 w-full mt-3"
            onClick={handleSubmit}
          >
            إرسال
          </button>
          <div className="text-right text-sm text-gray-500 mt-4">
            <div className="flex items-center space-x-2 mt-10">
              <div
                className=" mr-7 cursor-pointer"
                onClick={() => navigate("/")}
              >
                تخطي
              </div>

              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
              <div className="w-1/4 h-1 bg-blue-500 rounded"></div>
              <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Image and Text */}
        <div className="w-full lg:w-1/2 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center  text-white">
          <h2 className="text-2xl font-bold mb-4 text-center mt-7 px-2">
            قم بتنزيل الفيديوهات المفضلة لديك بسهولة ومن أي رابط على الإنترنت
          </h2>
          <p className="text-2xl font-bold mb-4 text-center px-2">
            ! املأ بياناتك الآن وابدأ في التحميل
          </p>
          <img
            src="/5.svg"
            alt="Person"
            className="rounded-lg mt-16 object-cover  w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default InputDetails;
