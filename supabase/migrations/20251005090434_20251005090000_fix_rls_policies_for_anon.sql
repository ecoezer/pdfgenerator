/*
  # Fix RLS Policies for Anonymous Users

  1. Changes
    - Allow anonymous (anon) users to insert, update, and delete menus and related data
    - Keep public read access for all tables
    - Enable full CRUD operations for anonymous users (for testing/demo purposes)

  2. Security Notes
    - This configuration is suitable for demo/testing environments
    - For production, consider implementing user authentication
*/

DROP POLICY IF EXISTS "Authenticated users can insert menus" ON menus;
DROP POLICY IF EXISTS "Authenticated users can update menus" ON menus;
DROP POLICY IF EXISTS "Authenticated users can delete menus" ON menus;

DROP POLICY IF EXISTS "Authenticated users can insert menu sections" ON menu_sections;
DROP POLICY IF EXISTS "Authenticated users can update menu sections" ON menu_sections;
DROP POLICY IF EXISTS "Authenticated users can delete menu sections" ON menu_sections;

DROP POLICY IF EXISTS "Authenticated users can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can delete menu items" ON menu_items;

CREATE POLICY "Anyone can insert menus"
  ON menus FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update menus"
  ON menus FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete menus"
  ON menus FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert menu sections"
  ON menu_sections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update menu sections"
  ON menu_sections FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete menu sections"
  ON menu_sections FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert menu items"
  ON menu_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update menu items"
  ON menu_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete menu items"
  ON menu_items FOR DELETE
  TO anon, authenticated
  USING (true);