-- إضافة RLS policies للشكاوي للمستخدمين المسجلين فقط

-- السماح للمستخدمين المسجلين بإرسال الشكاوي
CREATE POLICY "Allow authenticated users to insert complaints" ON complaints
FOR INSERT TO authenticated
WITH CHECK (true);

-- السماح للمستخدمين بقراءة شكاويهم الخاصة فقط
CREATE POLICY "Users can view their own complaints" ON complaints
FOR SELECT TO authenticated
USING (user_email = auth.jwt() ->> 'email');

-- السماح للمسؤولين بقراءة جميع الشكاوي
CREATE POLICY "Admins can view all complaints" ON complaints
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@example.com'
  )
);

-- السماح للمسؤولين بتحديث حالة الشكاوي
CREATE POLICY "Admins can update complaints" ON complaints
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@example.com'
  )
);
