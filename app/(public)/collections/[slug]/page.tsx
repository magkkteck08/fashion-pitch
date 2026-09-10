export default function CollectionPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-24">
      <h1 className="text-3xl font-serif text-slate-900">Collection: {params.slug}</h1>
    </div>
  );
}