"use client"

import { useEffect } from "react"

export default function TermsPage() {
  useEffect(() => {
    // التحقق من وجود hash في الرابط والتمرير إليه
    if (window.location.hash) {
      const elementId = window.location.hash.substring(1)
      const element = document.getElementById(elementId)
      if (element) {
        // حساب موضع العنصر وطرح ربع ارتفاع الشاشة
        const elementTop = element.offsetTop
        const quarterScreen = window.innerHeight / 4
        const scrollPosition = elementTop - quarterScreen

        setTimeout(() => {
          window.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
          })
        }, 100)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg max-w-none text-right" dir="rtl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">الشروط والأحكام</h1>

        <div className="space-y-8">
          <section>
            <h2 id="general" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              1. الشروط العامة
            </h2>
            <p className="text-gray-700 leading-relaxed">
              مرحباً بك في متجر ليڤو. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا
              توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
            </p>
          </section>

          <section>
            <h2 id="about" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              2. نشاط المتجر
            </h2>
            <p className="text-gray-700 leading-relaxed">
              متجر Levo متخصص في بيع الملابس العصرية والأنيقة للرجال والنساء والأطفال. نحن نسعى لتقديم أفضل المنتجات
              بأعلى جودة وأفضل الأسعار.
            </p>
          </section>

          <section>
            <h2 id="privacy" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              3. سياسة الخصوصية
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              نحن نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية. المعلومات التي نجمعها تشمل:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li>الاسم وعنوان البريد الإلكتروني</li>
              <li>عنوان الشحن ومعلومات الاتصال</li>
              <li>تفضيلات التسوق وسجل المشتريات</li>
              <li>معلومات الدفع (مشفرة وآمنة)</li>
            </ul>
          </section>

          <section>
            <h2 id="returns" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              4. سياسة الاسترجاع والاستبدال
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">حالياً لا نقبل الترجيع إلا إذا كان المنتج به عيب صناعي.</p>
            <p className="text-gray-700 leading-relaxed mb-4">في حال وجود مشكلة:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
              <li className="text-gray-700">يجب الإبلاغ عن المشكلة خلال 48 ساعة من استلام المنتج</li>
              <li className="text-gray-700">إرسال صور واضحة للعيب أو المشكلة</li>
              <li className="text-gray-700">الاحتفاظ بالمنتج في حالته الأصلية</li>
              <li className="text-gray-700">تقديم رقم الطلب ومعلومات الشراء</li>
            </ul>
          </section>

          <section>
            <h2 id="shipping" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              5. التأخير في التوصيل
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              عند التأخير في التوصيل عن المدة المحددة، يتم خصم 25% من سعر المنتج كتعويض.
            </p>
            <p className="text-gray-700 leading-relaxed">
              المسؤولية الكاملة على متجر Chiaka (SHK)، وليس على شركة الشحن.
            </p>
          </section>

          <section>
            <h2 id="faq" className="text-2xl font-semibold mb-4 text-gray-800 scroll-mt-32">
              6. الأسئلة الشائعة
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">كم تستغرق عملية الشحن؟</h3>
                <p className="text-gray-700">عادة ما تستغرق عملية الشحن من 3-7 أيام عمل داخل المملكة.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">هل يمكنني تغيير طلبي بعد تأكيده؟</h3>
                <p className="text-gray-700">يمكن تعديل الطلب خلال ساعة واحدة من تأكيده، بعد ذلك لا يمكن التعديل.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">ما هي طرق الدفع المتاحة؟</h3>
                <p className="text-gray-700">نقبل الدفع عند الاستلام، والتحويل البنكي، وبطاقات الائتمان.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. تعديل الشروط</h2>
            <p className="text-gray-700 leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعار العملاء بأي تغييرات مهمة عبر البريد
              الإلكتروني أو من خلال إشعار على الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. الاتصال بنا</h2>
            <p className="text-gray-700 leading-relaxed">
              إذا كان لديك أي استفسارات حول هذه الشروط والأحكام، يمكنك التواصل معنا عبر:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4 mt-4">
              <li>البريد الإلكتروني: info@familyme.com</li>
              <li>الهاتف: +966 50 123 4567</li>
              <li>العنوان: الرياض، المملكة العربية السعودية</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString("ar-SA")}</p>
        </div>
      </div>
    </div>
  )
}
