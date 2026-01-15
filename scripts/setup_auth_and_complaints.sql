-- إعداد نظام المصادقة والشكاوي للمستخدمين المسجلين فقط

-- إنشاء جدول المستخدمين إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- تفعيل RLS على جدول المستخدمين
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لرؤية بياناتهم فقط
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- سياسة للمستخدمين لتحديث بياناتهم فقط
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- سياسة لإدراج المستخدمين الجدد
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- تحديث سياسات جدول الشكاوي للمستخدمين المسجلين فقط
DROP POLICY IF EXISTS "Allow public complaints insert" ON public.complaints;
DROP POLICY IF EXISTS "Allow public complaints select" ON public.complaints;
DROP POLICY IF EXISTS "Allow admin complaints update" ON public.complaints;

-- سياسة للمستخدمين المسجلين لإرسال الشكاوي
CREATE POLICY "Authenticated users can insert complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (true);

-- سياسة للمستخدمين لرؤية شكاويهم فقط
CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

-- سياسة للمسؤولين لرؤية جميع الشكاوي
CREATE POLICY "Admins can view all complaints" ON public.complaints
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email = 'admin@example.com'
    )
  );

-- سياسة للمسؤولين لتحديث الشكاوي
CREATE POLICY "Admins can update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email = 'admin@example.com'
    )
  );

-- إنشاء دالة لإنشاء ملف المستخدم تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لتشغيل الدالة عند تسجيل مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
