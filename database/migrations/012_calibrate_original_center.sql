-- Browser-measured base calibration: 0 degrees aligns artwork center to mug center.
UPDATE product_templates
SET uv_config = jsonb_set(uv_config::jsonb, '{offsetX}', '0.892')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
