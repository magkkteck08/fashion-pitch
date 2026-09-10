"use client";
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ImageUpload({ onUpload, bucket = 'products' }: { onUpload: (url: string) => void, bucket?: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUpload(data.publicUrl);
    } catch (error) {
      alert('Error uploading image. Please check your Supabase Storage policies.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-slate-300 p-8 text-center rounded-sm bg-slate-50 relative overflow-hidden transition hover:bg-slate-100">
      {uploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-amber-700 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-700">Uploading to Supabase...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <UploadCloud className="text-slate-400 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-700">Tap to upload image</p>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}