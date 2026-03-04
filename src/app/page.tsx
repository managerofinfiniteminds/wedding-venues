import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&h=900&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="playfair text-5xl md:text-7xl font-bold mb-4 leading-tight">
            Green Bowtie
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 font-light">
            Find your perfect moment in the Tri-Valley
          </p>

          {/* Search */}
          <form action="/venues" method="get" className="flex gap-2 max-w-lg mx-auto mb-8">
            <input
              type="text"
              name="city"
              placeholder="Search by city (e.g. Livermore)..."
              className="flex-1 px-5 py-3 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white shadow-lg"
            />
            <button
              type="submit"
              className="bg-pink-700 hover:bg-pink-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* City quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Livermore", "Pleasanton", "Dublin", "San Ramon", "Danville"].map((city) => (
              <Link
                key={city}
                href={`/venues?city=${city}`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm px-4 py-2 rounded-full transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
