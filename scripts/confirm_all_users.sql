-- تأكيد جميع المستخدمين تلقائياً
-- هذا السكريبت يؤكد جميع المستخدمين الذين لم يتم تأكيدهم بعد

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
