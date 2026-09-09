BEGIN;
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'DRAFT';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS editor_type text NOT NULL DEFAULT 'MUG_3D';
ALTER TABLE products ADD COLUMN IF NOT EXISTS accent text NOT NULL DEFAULT '#dce8d5';
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT '';

INSERT INTO product_categories(name,slug,sort_order) VALUES
 ('แก้ว','mugs',10),('แก้วเก็บอุณหภูมิ','tumblers',20),('เสื้อ','apparel',30)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order;

UPDATE products SET slug=COALESCE(slug,id),category_id=(SELECT id FROM product_categories WHERE slug='mugs'),status='AVAILABLE',sort_order=10,editor_type='MUG_3D',accent='#dce8d5',badge='พร้อมออกแบบ' WHERE id='ceramic-mug-11oz';
INSERT INTO products(id,name,description,price_satang,active,slug,category_id,status,sort_order,editor_type,accent,badge) VALUES
 ('yeti-tumbler-20oz','แก้วเยติ 20 oz','พื้นที่ใหญ่ เก็บความเย็นนาน เตรียมรองรับ Live Preview 3D',49900,true,'yeti-tumbler-20oz',(SELECT id FROM product_categories WHERE slug='tumblers'),'COMING_SOON',10,'MUG_3D','#d5e4e7','เร็ว ๆ นี้'),
 ('classic-t-shirt','เสื้อยืด Classic','ออกแบบลายหน้าและหลัง พร้อมภาพจำลองขนาดพิมพ์จริง',39900,true,'classic-t-shirt',(SELECT id FROM product_categories WHERE slug='apparel'),'COMING_SOON',10,'APPAREL_2D','#eadccc','เร็ว ๆ นี้')
ON CONFLICT (id) DO NOTHING;

UPDATE products SET slug=id WHERE slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_catalog_order_idx ON products(category_id,status,sort_order);
COMMIT;
