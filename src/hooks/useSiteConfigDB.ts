import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json, defaultContact, defaultModules, defaultSiteConfig } from '@/types';

const RESTAURANT_SLUG = 'principal';

export interface SiteConfigDB {
  id: string;
  restaurant_id: string;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string | null;
  about_image: string | null;
  kitchen_text?: string | null;
  stats?: Json;
  modules: Json;
  contact: Json;
  updated_at: string;
}

type RestaurantRow = {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

type SettingsRow = {
  id: string;
  restaurant_id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  about_image: string | null;
  kitchen_text: string | null;
  stats: Json | null;
  modules: Json | null;
  contact: Json | null;
  updated_at: string | null;
  restaurants: RestaurantRow | null;
};

const defaultConfig: SiteConfigDB = {
  id: '',
  restaurant_id: '',
  brand_name: defaultSiteConfig.brand_name,
  logo_url: defaultSiteConfig.logo_url,
  primary_color: defaultSiteConfig.primary_color,
  secondary_color: defaultSiteConfig.secondary_color,
  hero_title: defaultSiteConfig.hero_title,
  hero_subtitle: defaultSiteConfig.hero_subtitle,
  about_text: defaultSiteConfig.about_text,
  about_image: defaultSiteConfig.about_image || null,
  kitchen_text: defaultSiteConfig.kitchen_text,
  stats: defaultSiteConfig.stats as unknown as Json,
  modules: defaultModules as unknown as Json,
  contact: defaultContact as unknown as Json,
  updated_at: new Date().toISOString(),
};

function mapConfig(row: SettingsRow | null): SiteConfigDB {
  if (!row) return defaultConfig;

  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    brand_name: row.restaurants?.name || defaultConfig.brand_name,
    logo_url: row.restaurants?.logo_url || null,
    primary_color: row.restaurants?.primary_color || defaultConfig.primary_color,
    secondary_color: row.restaurants?.secondary_color || defaultConfig.secondary_color,
    hero_title: row.hero_title || defaultConfig.hero_title,
    hero_subtitle: row.hero_subtitle || defaultConfig.hero_subtitle,
    about_text: row.about_text,
    about_image: row.about_image,
    kitchen_text: row.kitchen_text || defaultConfig.kitchen_text,
    stats: row.stats || defaultConfig.stats,
    modules: row.modules || defaultConfig.modules,
    contact: row.contact || defaultConfig.contact,
    updated_at: row.updated_at || defaultConfig.updated_at,
  };
}

export function useSiteConfigDB() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const configQuery = useQuery({
    queryKey: ['site_config', RESTAURANT_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select(`
          *,
          restaurants!inner(id, name, logo_url, primary_color, secondary_color)
        `)
        .eq('restaurants.slug', RESTAURANT_SLUG)
        .maybeSingle();

      if (error) throw error;
      return mapConfig(data as SettingsRow | null);
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<SiteConfigDB> | Record<string, unknown>) => {
      const currentConfig = configQuery.data;
      if (!currentConfig?.restaurant_id || !currentConfig?.id) {
        throw new Error('Configuração inicial não encontrada. Aplique a migration do Supabase primeiro.');
      }

      const restaurantUpdates = {
        name: updates.brand_name as string,
        logo_url: (updates.logo_url as string | null) || null,
        primary_color: updates.primary_color as string,
        secondary_color: updates.secondary_color as string,
      };

      const settingsUpdates = {
        hero_title: updates.hero_title as string,
        hero_subtitle: updates.hero_subtitle as string,
        about_text: (updates.about_text as string | null) || null,
        about_image: (updates.about_image as string | null) || null,
        kitchen_text: (updates.kitchen_text as string | null) || null,
        stats: updates.stats as Json,
        modules: updates.modules as Json,
        contact: updates.contact as Json,
      };

      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update(restaurantUpdates)
        .eq('id', currentConfig.restaurant_id);

      if (restaurantError) throw restaurantError;

      const { error: settingsError } = await supabase
        .from('site_settings')
        .update(settingsUpdates)
        .eq('id', currentConfig.id);

      if (settingsError) throw settingsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_config', RESTAURANT_SLUG] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram atualizadas no Supabase.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    error: configQuery.error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
}
