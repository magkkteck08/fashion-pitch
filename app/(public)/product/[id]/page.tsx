import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import ProductClient from './ProductClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. Define params as a Promise
type Props = {
  params: Promise<{ id: string }>;
};

// 2. Helper function to search both catalogs
async function fetchProductData(id: string) {
  // Check Main Catalog
  const { data: mainProduct } = await supabase.from('products').select('*').eq('id', id).single();
  if (mainProduct) return { ...mainProduct, tableType: 'products' };

  // Check Premium Signature Catalog
  const { data: premiumProduct } = await supabase.from('signature_products').select('*').eq('id', id).single();
  if (premiumProduct) return { ...premiumProduct, tableType: 'signature_products' };

  return null; 
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 3. Await the params before using the ID
  const resolvedParams = await params;
  const product = await fetchProductData(resolvedParams.id);

  if (!product) {
    return { title: 'Product Not Found | LUXE & CO.' };
  }

  const mainImage = product.image_url || product.image;

  return {
    title: `${product.name} | LUXE & CO.`,
    description: `Secure the ${product.name} for ₦${Number(product.price).toLocaleString()}. Curated luxury fashion by LUXE & CO.`,
    openGraph: {
      title: product.name,
      description: `Secure the ${product.name} for ₦${Number(product.price).toLocaleString()}. Curated luxury fashion by LUXE & CO.`,
      url: `https://yourdomain.com/product/${product.id}`,
      siteName: 'LUXE & CO.',
      images: [{ url: mainImage, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Secure the ${product.name} for ₦${Number(product.price).toLocaleString()}.`,
      images: [mainImage],
    },
  };
}

export default async function DynamicProductPage({ params }: Props) {
  // 4. Await the params before using the ID
  const resolvedParams = await params;
  const product = await fetchProductData(resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-serif text-slate-900 mb-4">Product Not Found</h1>
        <Link href="/" className="text-amber-700 uppercase tracking-widest text-xs font-bold hover:underline">
          Return to Store
        </Link>
      </div>
    );
  }

  return <ProductClient product={product} />;
}