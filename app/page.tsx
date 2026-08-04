import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 relative bg-cover bg-center"
      style={{ backgroundImage: `url('/dashboard.jpg')` }}
    >
      {/* Dark gradient overlay for readability over the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      <div className="relative z-10 max-w-4xl w-full text-center">

        {/* Logo / Brand */}
        <div className="mb-10">
          <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl overflow-hidden">
            {/* Replace with an actual photo of Brook if you have one, or keep the initial */}
            <span className="text-5xl font-bold text-white font-serif">B</span>
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Brook Yeshitila Gallery
          </p>

          <h1 className="mt-3 text-5xl md:text-6xl font-bold text-white tracking-tight">
            Where art meets<br />management
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
            A dedicated space to manage your artworks, stories, and collections —
            crafted with the same care as your creations.
          </p>
        </div>

        {/* Login Card */}
        <div className="mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome back, Brook
          </h2>

          <p className="text-gray-300 mb-8 text-sm">
            Sign in to manage your gallery
          </p>

          <Link
            href="/login"
            className="block w-full py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-[#d4af37] hover:text-white transition duration-300 shadow-lg"
          >
            Login to Dashboard
          </Link>

          <p className="mt-6 text-xs text-gray-400">
            Secure, private access for gallery administrators
          </p>
        </div>

        {/* Footer */}
        <p className="mt-12 text-gray-500 text-sm">
          © 2026 Brook Yeshitila Gallery. All rights reserved.
        </p>
      </div>
    </main>
  );
}