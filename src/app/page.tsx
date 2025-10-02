export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🍹 PourApp</h1>
        <p className="text-gray-600">Application de gestion de bar</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a href="/ingredients" className="border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="font-bold text-xl mb-2">📦 Ingrédients</h2>
          <p className="text-gray-600">Gérer vos ingrédients et stocks</p>
        </a>
        {/* Autres sections à venir */}
      </div>
    </main>
  )
}