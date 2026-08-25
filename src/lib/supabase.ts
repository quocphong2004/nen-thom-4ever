import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. ' +
      'Hãy copy .env.example thành .env và điền thông tin project Supabase của bạn.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PRODUCT_IMAGE_BUCKET = 'product-images';
export const BANNER_IMAGE_BUCKET = 'banner-images';

export function getPublicImageUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
