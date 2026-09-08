-- Handle is +X (UV .75); offset .25 maps its surface to the blank wrap seam.
-- Artwork center is therefore at -X (UV .25 -> texture center .50).
UPDATE product_templates
SET uv_config = jsonb_set(uv_config::jsonb, '{offsetX}', '0.25')
WHERE product_id = 'ceramic-mug-11oz' AND version = 1;
