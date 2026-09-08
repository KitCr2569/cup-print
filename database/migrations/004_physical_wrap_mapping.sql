-- A 20 cm print occupies only part of the 25.76 cm circumference.
-- The remaining gap is centered at the handle (+X), with artwork center at -X.
UPDATE product_templates
SET uv_config = jsonb_set(uv_config, '{offsetX}', '0.375')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
