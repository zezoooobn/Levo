-- إدراج الفئات الأساسية
INSERT INTO categories (name, name_ar, description) VALUES
('men', 'رجالي', 'ملابس رجالية عصرية وأنيقة'),
('women', 'نسائي', 'ملابس نسائية متنوعة وجذابة'),
('kids', 'أطفال', 'ملابس أطفال مريحة وآمنة'),
('accessories', 'إكسسوارات', 'إكسسوارات متنوعة لإطلالة مميزة')
ON CONFLICT (name) DO NOTHING;

-- إدراج منتجات تجريبية
INSERT INTO products (name, name_ar, description, description_ar, price, category_id, sizes, colors, stock_quantity, is_featured) 
SELECT 
  'Classic T-Shirt', 'تيشيرت كلاسيكي', 
  'Comfortable cotton t-shirt', 'تيشيرت قطني مريح وأنيق',
  150.00, c.id, 
  ARRAY['S', 'M', 'L', 'XL'], 
  ARRAY['أبيض', 'أسود', 'أزرق'], 
  50, true
FROM categories c WHERE c.name = 'men'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, name_ar, description, description_ar, price, category_id, sizes, colors, stock_quantity, is_featured) 
SELECT 
  'Elegant Dress', 'فستان أنيق', 
  'Beautiful evening dress', 'فستان سهرة جميل ومميز',
  350.00, c.id, 
  ARRAY['S', 'M', 'L'], 
  ARRAY['أحمر', 'أسود', 'أزرق داكن'], 
  30, true
FROM categories c WHERE c.name = 'women'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, name_ar, description, description_ar, price, category_id, sizes, colors, stock_quantity) 
SELECT 
  'Kids Hoodie', 'هودي أطفال', 
  'Warm and cozy hoodie for kids', 'هودي دافئ ومريح للأطفال',
  120.00, c.id, 
  ARRAY['2-3 سنة', '4-5 سنة', '6-7 سنة', '8-9 سنة'], 
  ARRAY['وردي', 'أزرق', 'أخضر'], 
  40
FROM categories c WHERE c.name = 'kids'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, name_ar, description, description_ar, price, category_id, colors, stock_quantity) 
SELECT 
  'Leather Bag', 'حقيبة جلدية', 
  'Premium leather handbag', 'حقيبة يد جلدية فاخرة',
  280.00, c.id, 
  ARRAY['بني', 'أسود', 'بيج'], 
  25
FROM categories c WHERE c.name = 'accessories'
ON CONFLICT DO NOTHING;
