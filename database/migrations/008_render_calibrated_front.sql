-- Final browser-render calibration for front artwork center with handle right.
UPDATE product_templates
SET uv_config = jsonb_set(uv_config, '{offsetX}', '0.375')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
