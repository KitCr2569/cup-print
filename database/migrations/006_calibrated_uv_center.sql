-- Calibrated against the rendered GLB: canvas center faces front, handle right.
UPDATE product_templates
SET uv_config = jsonb_set(uv_config, '{offsetX}', '0.375')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
