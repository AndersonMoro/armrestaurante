import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuCategory } from '@/types';

const RESTAURANT_SLUG = 'principal';
const ASSETS_BUCKET = 'restaurant-assets';

export interface MenuPDF {
  id: string;
  date: string;
  title: string;
  pdf_url: string;
  notes?: string | null;
  price_per_kg?: string | null;
  buffet_price?: string | null;
  categories?: MenuCategory[];
  active: boolean;
  created_at: string;
}

type MenuRow = {
  id: string;
  menu_date: string;
  title: string;
  pdf_url: string | null;
  notes: string | null;
  price_per_kg: string | null;
  buffet_price: string | null;
  active: boolean | null;
  created_at: string | null;
  menu_categories?: Array<{
    id: string;
    name: string;
    sort_order: number | null;
    menu_items?: Array<{
      id: string;
      name: string;
      description: string | null;
      price: string | null;
      image_url: string | null;
      available: boolean | null;
      sort_order: number | null;
    }>;
  }>;
};

function mapMenu(row: MenuRow): MenuPDF {
  return {
    id: row.id,
    date: row.menu_date,
    title: row.title,
    pdf_url: row.pdf_url || '',
    notes: row.notes || '',
    price_per_kg: row.price_per_kg || '',
    buffet_price: row.buffet_price || '',
    active: row.active !== false,
    created_at: row.created_at || '',
    categories: [...(row.menu_categories || [])]
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((category) => ({
        id: category.id,
        name: category.name,
        items: [...(category.menu_items || [])]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price || '',
            image_url: item.image_url || '',
            available: item.available !== false,
          })),
      })),
  };
}

async function getRestaurantId() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', RESTAURANT_SLUG)
    .single();

  if (error) throw error;
  return data.id as string;
}

async function replaceMenuCategories(menuId: string, categories: MenuCategory[] = []) {
  const { error: deleteError } = await supabase
    .from('menu_categories')
    .delete()
    .eq('menu_id', menuId);

  if (deleteError) throw deleteError;

  for (const [categoryIndex, category] of categories.entries()) {
    if (!category.name.trim() && category.items.length === 0) continue;

    const { data: createdCategory, error: categoryError } = await supabase
      .from('menu_categories')
      .insert({
        menu_id: menuId,
        name: category.name,
        sort_order: categoryIndex,
      })
      .select('id')
      .single();

    if (categoryError) throw categoryError;

    const items = category.items
      .filter((item) => item.name.trim())
      .map((item, itemIndex) => ({
        category_id: createdCategory.id,
        name: item.name,
        description: item.description || null,
        price: item.price || null,
        image_url: item.image_url || null,
        available: item.available !== false,
        sort_order: itemIndex,
      }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('menu_items').insert(items);
      if (itemsError) throw itemsError;
    }
  }
}

export function useMenus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const menusQuery = useQuery({
    queryKey: ['menus', RESTAURANT_SLUG],
    queryFn: async () => {
      const restaurantId = await getRestaurantId();
      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          menu_categories(
            id,
            name,
            sort_order,
            menu_items(id, name, description, price, image_url, available, sort_order)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('menu_date', { ascending: false });

      if (error) throw error;
      return (data || []).map((menu) => mapMenu(menu as MenuRow));
    },
  });

  const addMenuMutation = useMutation({
    mutationFn: async (menu: Omit<MenuPDF, 'id' | 'created_at'>) => {
      const restaurantId = await getRestaurantId();
      const { data, error } = await supabase
        .from('menus')
        .insert({
          restaurant_id: restaurantId,
          menu_date: menu.date,
          title: menu.title,
          notes: menu.notes || null,
          price_per_kg: menu.price_per_kg || null,
          buffet_price: menu.buffet_price || null,
          pdf_url: menu.pdf_url || null,
          active: menu.active,
        })
        .select('id')
        .single();

      if (error) throw error;
      await replaceMenuCategories(data.id, menu.categories || []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', RESTAURANT_SLUG] });
      queryClient.invalidateQueries({ queryKey: ['dinner_events', RESTAURANT_SLUG] });
      toast({
        title: 'Cardápio cadastrado',
        description: 'O novo cardápio foi salvo no Supabase.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MenuPDF> }) => {
      const { error } = await supabase
        .from('menus')
        .update({
          menu_date: updates.date,
          title: updates.title,
          notes: updates.notes || null,
          price_per_kg: updates.price_per_kg || null,
          buffet_price: updates.buffet_price || null,
          pdf_url: updates.pdf_url || null,
          active: updates.active,
        })
        .eq('id', id);

      if (error) throw error;
      await replaceMenuCategories(id, updates.categories || []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', RESTAURANT_SLUG] });
      queryClient.invalidateQueries({ queryKey: ['dinner_events', RESTAURANT_SLUG] });
      toast({
        title: 'Cardápio atualizado',
        description: 'As alterações foram salvas no Supabase.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menus').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', RESTAURANT_SLUG] });
      toast({
        title: 'Cardápio excluído',
        description: 'O cardápio foi removido.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const uploadMenuFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const extension = file.name.split('.').pop() || 'pdf';
      const path = `menus/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from(ASSETS_BUCKET)
        .upload(path, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getMenuByDate = (date: string) => {
    return menusQuery.data?.find((menu) => menu.date === date && menu.active);
  };

  return {
    menus: menusQuery.data ?? [],
    isLoading: menusQuery.isLoading,
    error: menusQuery.error,
    addMenu: addMenuMutation.mutate,
    updateMenu: (id: string, updates: Partial<MenuPDF>) =>
      updateMenuMutation.mutate({ id, updates }),
    deleteMenu: deleteMenuMutation.mutate,
    uploadMenuFile: uploadMenuFileMutation.mutateAsync,
    getMenuByDate,
    isAddingMenu: addMenuMutation.isPending,
    isUpdatingMenu: updateMenuMutation.isPending,
    isDeletingMenu: deleteMenuMutation.isPending,
    isUploadingMenuFile: uploadMenuFileMutation.isPending,
  };
}
