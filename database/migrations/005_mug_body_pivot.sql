-- v4 keeps the model origin on the body axis instead of centering body + handle.
UPDATE product_templates
SET model_config = jsonb_set(model_config, '{path}', '"/models/mug-11oz.glb?v=4"')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
