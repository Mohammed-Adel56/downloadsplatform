function HowItWorks() {
  return (
    <section className="py-20 text-center bg-gray-50">
      <h2 className="text-3xl font-bold mb-6">كيف يعمل موقعنا</h2>
      <p className="font-medium my-5 text-[#4C5A5C]">
        استمتع بخدمات بتجربة تحميل متكاملة وسريعة بسهولة وأمان
      </p>
      <div className="flex md:justify-around  items-center flex-col md:flex-row">
        <div className=" w-72">
          <img src="/public/4.png" alt="" className="mx-auto my-3 " />
          <h3 className="text-xl font-bold my-3">أبداء التحميل</h3>
          <p className="font-sm text-center text-[#6e797a]">
            اضغط علي زر التحميل واحفظ الملف مباشرة أو أرسله إلي التطبيق
          </p>
        </div>
        <div className=" w-72">
          <img src="/public/3.png" alt="" className="mx-auto my-3 shadow-md" />
          <h3 className="text-xl font-bold my-3">اختر نوع التحميل</h3>
          <p className="font-sm text-center text-[#6e797a]">
            {" "}
            حدد نوع وجودة الوسائط التي ترغب في تحميلها صورة فيديو ام جميع الصيغ
          </p>
        </div>
        <div className=" w-72">
          <img src="/public/2.png" alt="" className="mx-auto my-3 shadow-md" />
          <h3 className="text-xl font-bold my-3">أدخل الرابط</h3>
          <p className="font-sm text-center text-[#6e797a]">
            {" "}
            .لصق رابط الوسائط في الحقل مباشرة من أي مصدر
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
