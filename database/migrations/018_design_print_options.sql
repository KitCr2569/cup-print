ALTER TABLE products ADD COLUMN IF NOT EXISTS print_options jsonb NOT NULL DEFAULT '[{"type":"ONE_SIDE","label":"1 ด้าน","priceSatang":15000,"isEnabled":true,"widthCm":8,"heightCm":8},{"type":"TWO_SIDES","label":"2 ด้าน","priceSatang":18000,"isEnabled":true,"widthCm":20,"heightCm":9},{"type":"FULL_WRAP","label":"รอบแก้ว","priceSatang":19900,"isEnabled":true,"widthCm":20,"heightCm":9}]';
ALTER TABLE designs ADD COLUMN IF NOT EXISTS print_option text NOT NULL DEFAULT 'FULL_WRAP';
ALTER TABLE designs ADD COLUMN IF NOT EXISTS print_placement text;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS unit_price_satang integer;
UPDATE designs d SET unit_price_satang=p.price_satang FROM products p WHERE d.product_id=p.id AND d.unit_price_satang IS NULL;
ALTER TABLE designs ALTER COLUMN unit_price_satang SET NOT NULL;
ALTER TABLE designs ADD CONSTRAINT designs_print_option_check CHECK(print_option IN ('ONE_SIDE','TWO_SIDES','FULL_WRAP'));
ALTER TABLE designs ADD CONSTRAINT designs_print_placement_check CHECK((print_option='ONE_SIDE' AND print_placement IN ('FRONT','LEFT','RIGHT')) OR (print_option<>'ONE_SIDE' AND print_placement IS NULL));
