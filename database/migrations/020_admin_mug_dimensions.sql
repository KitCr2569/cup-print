-- Mug and print dimensions remain versioned in product_templates JSONB.
-- This migration documents and validates existing configuration before Admin editing is enabled.
UPDATE product_templates SET mug_config=mug_config,print_config=print_config WHERE false;
