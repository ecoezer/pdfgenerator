/*
  # Add Fold Types to Templates

  1. Changes
    - Add `fold_type` column to templates table
      - einbruchfalz: Single fold in the middle (2 panels)
      - wickelfalz: Roll/wrap fold (panels fold inward in sequence)
      - zickzackfalz: Zigzag/accordion fold (alternating back and forth)
    - Add `panels` column to store number of panels created by fold type
    - Update existing templates with default fold type

  2. Important Notes
    - Each fold type creates different panel layouts
    - Panel count determines content structure
    - Einbruchfalz = 2 panels (most common for simple menus)
    - Wickelfalz = 3-4 panels typically
    - Zickzackfalz = 3-6 panels typically
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'fold_type'
  ) THEN
    ALTER TABLE templates ADD COLUMN fold_type text DEFAULT 'einbruchfalz';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'panels'
  ) THEN
    ALTER TABLE templates ADD COLUMN panels integer DEFAULT 2;
  END IF;
END $$;

DELETE FROM templates;

INSERT INTO templates (name, width_mm, height_mm, bleed_mm, safe_margin_mm, fold_type, panels) VALUES
  ('A4 Portrait - Einbruchfalz (2 panels)', 210, 297, 3, 5, 'einbruchfalz', 2),
  ('A4 Landscape - Einbruchfalz (2 panels)', 297, 210, 3, 5, 'einbruchfalz', 2),
  ('A4 Portrait - Wickelfalz (3 panels)', 210, 297, 3, 5, 'wickelfalz', 3),
  ('A4 Landscape - Wickelfalz (3 panels)', 297, 210, 3, 5, 'wickelfalz', 3),
  ('A4 Portrait - Zickzackfalz (3 panels)', 210, 297, 3, 5, 'zickzackfalz', 3),
  ('A4 Landscape - Zickzackfalz (3 panels)', 297, 210, 3, 5, 'zickzackfalz', 3),
  ('A5 Portrait - Einbruchfalz (2 panels)', 148, 210, 3, 5, 'einbruchfalz', 2),
  ('A5 Landscape - Einbruchfalz (2 panels)', 210, 148, 3, 5, 'einbruchfalz', 2),
  ('Letter Portrait - Einbruchfalz (2 panels)', 215.9, 279.4, 3, 5, 'einbruchfalz', 2),
  ('Letter Landscape - Einbruchfalz (2 panels)', 279.4, 215.9, 3, 5, 'einbruchfalz', 2),
  ('Letter Portrait - Wickelfalz (3 panels)', 215.9, 279.4, 3, 5, 'wickelfalz', 3),
  ('Letter Landscape - Wickelfalz (3 panels)', 279.4, 215.9, 3, 5, 'wickelfalz', 3),
  ('Tabloid - Wickelfalz (4 panels)', 279.4, 431.8, 3, 5, 'wickelfalz', 4),
  ('Tabloid - Zickzackfalz (4 panels)', 279.4, 431.8, 3, 5, 'zickzackfalz', 4);