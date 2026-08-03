import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 px-6">
      <div className="max-w-4xl w-full text-center">

        {/* Logo / Brand */}
        <div className="mb-10">
          <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
            <span className="text-5xl font-bold text-white">
              B
            </span>
          </div>

          <h1 className="mt-6 text-6xl font-bold text-white tracking-tight">
            Welcome to <span className="text-blue-400">Brook</span>
          </h1>

          <p className="mt-5 text-xl text-gray-300 max-w-2xl mx-auto">
            A smart dashboard to manage your products, customers,
            and online store operations easily.
          </p>
        </div>


        {/* Login Card */}
        <div className="mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          <h2 className="text-2xl font-semibold text-white mb-3">
            Welcome Back
          </h2>

          <p className="text-gray-300 mb-8">
            Login to access your Brook dashboard
          </p>


          <Link
            href="/login"
            className="block w-full py-4 rounded-xl bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition duration-300 shadow-lg"
          >
            Login to Dashboard
          </Link>


          <p className="mt-6 text-sm text-gray-400">
            Secure access for Brook administrators
          </p>

        </div>


        {/* Footer */}
        <p className="mt-12 text-gray-500 text-sm">
          © 2026 Brook. All rights reserved.
        </p>

      </div>
    </main>
  );
}