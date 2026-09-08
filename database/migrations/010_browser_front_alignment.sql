-- Browser calibration after the v5 UV rewrite: artwork center faces the camera.
UPDATE product_templates
SET uv_config = jsonb_set(uv_config::jsonb, '{offsetX}', '0.875')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
