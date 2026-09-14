"use client";
import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ImageUpload({ onUpload, bucket = 'products' }: { onUpload: (url: string) => void, bucket?: string }) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      
      // Pack the file and the bucket name into a form
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      // Send it to your new secure server route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        onUpload(data.url); // Success! Pass the URL back to the form
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-slate-300 p-8 text-center rounded-sm bg-slate-50 relative overflow-hidden transition hover:bg-slate-100">
      {uploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-amber-700 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-700">Uploading securely...</p>
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