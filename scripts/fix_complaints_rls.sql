-- إصلاح Row Level Security لجدول الشكاوي
-- السماح للجميع بإدراج الشكاوي (حتى الزوار غير المسجلين)

-- إضافة policy للسماح بإدراج الشكاوي للجميع
CREATE POLICY IF NOT EXISTS "Allow anyone to insert complaints" 
ON complaints 
FOR INSERT 
WITH CHECK (true);

-- إضافة policy للسماح للمسؤولين بقراءة جميع الشكاوي
CREATE POLICY IF NOT EXISTS "Allow admins to read all complaints" 
ON complaints 
FOR SELECT 
USING (true);

-- إضافة policy للسماح للمسؤولين بتحديث الشكاوي
CREATE POLICY IF NOT EXISTS "Allow admins to update complaints" 
ON complaints 
FOR UPDATE 
USING (true);
