UPDATE product_templates
SET mug_config = jsonb_set(mug_config, '{heightCm}', '10.2'),
    model_config = jsonb_set(model_config, '{path}', '"/models/mug-11oz.glb?v=3"'),
    uv_config = jsonb_set(uv_config, '{offsetX}', '0.25')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
