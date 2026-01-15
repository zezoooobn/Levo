-- إضافة عمود password إلى جدول user_profiles إذا لم يكن موجوداً
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- إضافة عمود is_active للتحكم في تفعيل الحساب
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- إضافة عمود last_login لتتبع آخر تسجيل دخول
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
