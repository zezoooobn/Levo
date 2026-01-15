-- تأكيد المستخدمين تلقائياً عند التسجيل
-- هذا السكريبت ينشئ trigger يؤكد المستخدمين الجدد تلقائياً

-- أولاً: تأكيد جميع المستخدمين الحاليين
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ثانياً: إنشاء دالة لتأكيد المستخدمين الجدد تلقائياً
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- تأكيد المستخدم الجديد تلقائياً
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ثالثاً: إنشاء trigger يعمل عند إضافة مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- رسالة نجاح
DO $$
BEGIN
  RAISE NOTICE 'تم تفعيل التأكيد التلقائي للمستخدمين بنجاح';
END $$;
