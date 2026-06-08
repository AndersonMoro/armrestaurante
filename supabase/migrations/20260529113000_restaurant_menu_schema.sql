-- Fresh schema for a single-client restaurant menu app.
-- Public users can read the published site/menu. Authenticated users can manage content.

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Restaurante',
  slug TEXT NOT NULL UNIQUE DEFAULT 'principal',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0369a1',
  secondary_color TEXT NOT NULL DEFAULT '#e0f2fe',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  hero_title TEXT NOT NULL DEFAULT 'Cardápio do Dia',
  hero_subtitle TEXT NOT NULL DEFAULT 'Restaurante com sabor de tradição',
  about_text TEXT,
  about_image TEXT,
  kitchen_text TEXT,
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  modules JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);

CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  price_per_kg TEXT,
  buffet_price TEXT,
  pdf_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  label TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurants_updated_at ON public.restaurants;
CREATE TRIGGER restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS menus_updated_at ON public.menus;
CREATE TRIGGER menus_updated_at
BEFORE UPDATE ON public.menus
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS menus_restaurant_date_idx ON public.menus (restaurant_id, menu_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS menus_one_active_per_date_idx
ON public.menus (restaurant_id, menu_date)
WHERE active = true;
CREATE INDEX IF NOT EXISTS menu_categories_menu_idx ON public.menu_categories (menu_id, sort_order);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON public.menu_items (category_id, sort_order);

INSERT INTO public.restaurants (name, slug)
VALUES ('Restaurante', 'principal')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_settings (restaurant_id, hero_title, hero_subtitle)
SELECT id, 'Cardápio do Dia', 'Restaurante com sabor de tradição'
FROM public.restaurants
WHERE slug = 'principal'
ON CONFLICT (restaurant_id) DO NOTHING;

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read restaurants" ON public.restaurants;
CREATE POLICY "Public can read restaurants" ON public.restaurants
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage restaurants" ON public.restaurants;
CREATE POLICY "Authenticated can manage restaurants" ON public.restaurants
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read settings" ON public.site_settings;
CREATE POLICY "Public can read settings" ON public.site_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage settings" ON public.site_settings;
CREATE POLICY "Authenticated can manage settings" ON public.site_settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read active menus" ON public.menus;
CREATE POLICY "Public can read active menus" ON public.menus
FOR SELECT USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can manage menus" ON public.menus;
CREATE POLICY "Authenticated can manage menus" ON public.menus
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read menu categories" ON public.menu_categories;
CREATE POLICY "Public can read menu categories" ON public.menu_categories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.menus
    WHERE menus.id = menu_categories.menu_id
    AND (menus.active = true OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "Authenticated can manage menu categories" ON public.menu_categories;
CREATE POLICY "Authenticated can manage menu categories" ON public.menu_categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read menu items" ON public.menu_items;
CREATE POLICY "Public can read menu items" ON public.menu_items
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.menu_categories
    JOIN public.menus ON menus.id = menu_categories.menu_id
    WHERE menu_categories.id = menu_items.category_id
    AND (menus.active = true OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "Authenticated can manage menu items" ON public.menu_items;
CREATE POLICY "Authenticated can manage menu items" ON public.menu_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read menu assets" ON public.menu_assets;
CREATE POLICY "Public can read menu assets" ON public.menu_assets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.menus
    WHERE menus.id = menu_assets.menu_id
    AND (menus.active = true OR auth.role() = 'authenticated')
  )
);

DROP POLICY IF EXISTS "Authenticated can manage menu assets" ON public.menu_assets;
CREATE POLICY "Authenticated can manage menu assets" ON public.menu_assets
FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read restaurant assets" ON storage.objects;
CREATE POLICY "Public can read restaurant assets" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Authenticated can manage restaurant assets" ON storage.objects;
CREATE POLICY "Authenticated can manage restaurant assets" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'restaurant-assets')
WITH CHECK (bucket_id = 'restaurant-assets');
