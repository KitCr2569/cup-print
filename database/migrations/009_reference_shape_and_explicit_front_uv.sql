-- v5 matches the reference proportions and bakes front/handle axes into the mesh UV.
UPDATE product_templates
SET mug_config = '{"capacityOz":11,"diameterCm":8.4,"heightCm":9.5}',
    model_config = jsonb_set(model_config::jsonb, '{path}', '"/models/mug-11oz.glb?v=5"'),
    uv_config = jsonb_set(uv_config::jsonb, '{offsetX}', '0')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
