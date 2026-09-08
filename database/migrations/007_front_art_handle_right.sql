-- Product presentation view: artwork center at +Z, handle at +X (screen right).
UPDATE product_templates
SET uv_config = jsonb_set(uv_config, '{offsetX}', '0.375')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
