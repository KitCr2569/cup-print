-- v6 preserves duplicated cylinder seam vertices and moves the seam behind the mug.
UPDATE product_templates
SET model_config = jsonb_set(model_config::jsonb, '{path}', '"/models/mug-11oz.glb?v=6"')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
