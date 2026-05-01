import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-600">Ziply</span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-6">
          Built for nonprofits
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Your nonprofit deserves a{" "}
          <span className="text-indigo-600">professional website</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          Fill out a simple wizard, pick your colors, and download a
          ready-to-deploy static site ZIP — no coding required. One-time fee of{" "}
          <strong className="text-gray-700">$29</strong>.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
          >
            Create your site →
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Guided Wizard",
              desc: "A clear, step-by-step form collects your org name, mission, programs, branding, and contact info.",
            },
            {
              title: "AI-Enhanced Content",
              desc: "Our AI polishes your writing for tone and clarity — you review and approve every change.",
            },
            {
              title: "Download & Deploy",
              desc: "Get a ZIP of your static site and host it free on Netlify, Cloudflare Pages, or GitHub Pages.",
            },
          ].map((f) => (
            <div key={f.title}>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
