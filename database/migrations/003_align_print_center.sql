-- Put artwork center on +Z (front) while the handle remains on +X (right side).
UPDATE product_templates
SET uv_config = jsonb_set(uv_config, '{offsetX}', '0.5')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
