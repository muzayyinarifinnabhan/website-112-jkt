import { supabase } from './supabase'

/**
 * Uploads an image to a Supabase bucket and returns the public URL.
 * @param {File} file 
 * @param {string} bucket 
 * @returns {Promise<string>} publicUrl
 */
export async function uploadImage(file, bucket = 'website') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error.message);
    throw error;
  }
}
