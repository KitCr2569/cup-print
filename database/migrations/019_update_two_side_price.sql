UPDATE products
SET print_options = (
  SELECT jsonb_agg(
    CASE WHEN option->>'type' = 'TWO_SIDES'
      THEN jsonb_set(option, '{priceSatang}', '18000'::jsonb)
      ELSE option
    END
    ORDER BY ordinal
  )
  FROM jsonb_array_elements(print_options) WITH ORDINALITY AS item(option, ordinal)
)
WHERE print_options IS NOT NULL;

ALTER TABLE products ALTER COLUMN print_options SET DEFAULT '[{"type":"ONE_SIDE","label":"1 ด้าน","priceSatang":15000,"isEnabled":true,"widthCm":8,"heightCm":8},{"type":"TWO_SIDES","label":"2 ด้าน","priceSatang":18000,"isEnabled":true,"widthCm":20,"heightCm":9},{"type":"FULL_WRAP","label":"รอบแก้ว","priceSatang":19900,"isEnabled":true,"widthCm":20,"heightCm":9}]';
