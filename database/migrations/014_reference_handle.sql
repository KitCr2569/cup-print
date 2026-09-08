-- Load the reference-shaped D handle model while preserving print UV settings.
UPDATE product_templates
SET model_config = jsonb_set(model_config::jsonb, '{path}', '"/models/mug-11oz.glb?v=7"')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
