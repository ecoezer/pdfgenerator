/*
  # Menu PDF Generator System Schema

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name (e.g., "A4 Portrait", "Letter Landscape")
      - `width_mm` (numeric) - Template width in millimeters
      - `height_mm` (numeric) - Template height in millimeters
      - `bleed_mm` (numeric) - Bleed area in millimeters (default 3mm)
      - `safe_margin_mm` (numeric) - Safe area margin in millimeters (default 5mm)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `menus`
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key to templates)
      - `name` (text) - Menu name
      - `description` (text) - Menu description
      - `logo_url` (text) - Optional logo URL
      - `background_color` (text) - Background color (RGB hex)
      - `text_color` (text) - Primary text color (RGB hex)
      - `accent_color` (text) - Accent color (RGB hex)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `menu_sections`
      - `id` (uuid, primary key)
      - `menu_id` (uuid, foreign key to menus)
      - `title` (text) - Section title (e.g., "Burgers", "Drinks")
      - `description` (text) - Section description
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `section_id` (uuid, foreign key to menu_sections)
      - `name` (text) - Item name
      - `description` (text) - Item description
      - `price` (numeric) - Item price
      - `image_url` (text) - Optional item image URL
      - `order_index` (integer) - Display order within section
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for testing)
    - Add policies for authenticated insert/update/delete

  3. Important Notes
    - All measurements in millimeters for print accuracy
    - RGB colors stored as hex, converted to CMYK during PDF generation
    - Templates support custom sizes for various print formats
    - Bleed and safe margins ensure professional print quality
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  width_mm numeric NOT NULL,
  height_mm numeric NOT NULL,
  bleed_mm numeric DEFAULT 3,
  safe_margin_mm numeric DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  logo_url text,
  background_color text DEFAULT '#FFFFFF',
  text_color text DEFAULT '#000000',
  accent_color text DEFAULT '#FF6B35',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES menus(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES menu_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to templates"
  ON templates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to menus"
  ON menus FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to menu sections"
  ON menu_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete templates"
  ON templates FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert menus"
  ON menus FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menus"
  ON menus FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menus"
  ON menus FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert menu sections"
  ON menu_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu sections"
  ON menu_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu sections"
  ON menu_sections FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO templates (name, width_mm, height_mm, bleed_mm, safe_margin_mm) VALUES
  ('A4 Portrait', 210, 297, 3, 5),
  ('A4 Landscape', 297, 210, 3, 5),
  ('Letter Portrait (US)', 215.9, 279.4, 3, 5),
  ('Letter Landscape (US)', 279.4, 215.9, 3, 5),
  ('A5 Portrait', 148, 210, 3, 5),
  ('Tabloid (11x17")', 279.4, 431.8, 3, 5);