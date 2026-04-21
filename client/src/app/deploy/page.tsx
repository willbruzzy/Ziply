"use client";

import FlowNav from "@/components/FlowNav";

export default function DeployPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Deploying Your Ziply Website</h1>
        <p className="text-sm text-gray-500 mb-8">
          You don&rsquo;t need to be technical for this. Both options below are free, and most people
          can have a live website in under five minutes.
        </p>

        {/* What you downloaded */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">What You Just Downloaded</h2>
          <p className="text-sm text-gray-600 mb-3">When you open your ZIP, you&rsquo;ll see two files:</p>
          <ul className="space-y-1 text-sm text-gray-600 mb-3 list-disc list-inside">
            <li>
              <code className="bg-gray-100 px-1 rounded">index.html</code> — your whole website:
              every page, every word, every picture.
            </li>
            <li>
              <code className="bg-gray-100 px-1 rounded">styles.css</code> — what makes it look
              pretty.
            </li>
          </ul>
          <p className="text-sm text-gray-600 mb-3">
            The images you uploaded in the wizard are already embedded inside{" "}
            <code className="bg-gray-100 px-1 rounded">index.html</code>, so there&rsquo;s no
            separate image folder to worry about.
          </p>
          <p className="text-sm text-gray-600">
            <strong>First:</strong> unzip the file. On Windows, right-click and pick{" "}
            <em>Extract All</em>. On a Mac, just double-click the ZIP.
          </p>
        </section>

        {/* Netlify */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-900">Option 1: Netlify</h2>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
              Easiest — drag and drop
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Get Your Site Online</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>
                  Head to{" "}
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    app.netlify.com/drop
                  </a>
                  .
                </li>
                <li>Open the folder where you unzipped your Ziply files.</li>
                <li>
                  Drag both files (<code className="bg-gray-100 px-1 rounded">index.html</code> and{" "}
                  <code className="bg-gray-100 px-1 rounded">styles.css</code>) onto the page — or
                  drag the whole folder.
                </li>
                <li>
                  Netlify gives you a live URL instantly, something like{" "}
                  <code className="bg-gray-100 px-1 rounded">https://silly-penguin-12345.netlify.app</code>
                  .
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Make It Permanent</h3>
              <p className="text-sm text-gray-600 mb-2">
                That first URL is temporary — it expires in 24 hours unless you claim it.
              </p>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>On the deploy page, click <strong>Claim your site</strong>.</li>
                <li>Sign up for a free Netlify account (email or GitHub both work).</li>
                <li>Your site is now permanent with a dashboard to manage it.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Pick a Custom URL</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Open your site from the Netlify dashboard.</li>
                <li>Click <strong>Site configuration → Change site name</strong>.</li>
                <li>
                  Type something like <code className="bg-gray-100 px-1 rounded">my-nonprofit</code>{" "}
                  — your URL becomes{" "}
                  <code className="bg-gray-100 px-1 rounded">https://my-nonprofit.netlify.app</code>.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Connect Your Own Domain</h3>
              <p className="text-sm text-gray-600 mb-2">
                If you own a domain like <code className="bg-gray-100 px-1 rounded">mynonprofit.org</code>:
              </p>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Go to <strong>Domain management → Add a domain</strong>.</li>
                <li>Netlify walks you through the DNS settings at your registrar.</li>
                <li>HTTPS (the padlock) is set up for you automatically.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Updating Your Site</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Unzip your new Ziply download.</li>
                <li>Go to your site&rsquo;s <strong>Deploys</strong> tab in Netlify.</li>
                <li>Drag the new files onto the page. Your site updates in seconds.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* GitHub Pages */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-900">Option 2: GitHub Pages</h2>
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              Good if you use GitHub
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            You&rsquo;ll need a free{" "}
            <a
              href="https://github.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              GitHub account
            </a>
            .
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Get Your Site Online</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>
                  Click <strong>+</strong> in GitHub and pick <strong>New repository</strong>. Name
                  it (e.g. <code className="bg-gray-100 px-1 rounded">my-nonprofit-site</code>), set
                  it to <strong>Public</strong>, and check <strong>Add a README file</strong>.
                </li>
                <li>
                  On the repo page, click <strong>Add file → Upload files</strong>. Drag in{" "}
                  <code className="bg-gray-100 px-1 rounded">index.html</code> and{" "}
                  <code className="bg-gray-100 px-1 rounded">styles.css</code>, then commit.
                </li>
                <li>
                  Go to <strong>Settings → Pages</strong>. Under Source pick{" "}
                  <strong>Deploy from a branch</strong>, then{" "}
                  <code className="bg-gray-100 px-1 rounded">main</code> /{" "}
                  <code className="bg-gray-100 px-1 rounded">root</code> and save.
                </li>
                <li>
                  Wait 1–2 minutes. A green banner in Pages settings will show your URL — something
                  like{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    https://your-username.github.io/my-nonprofit-site/
                  </code>
                  .
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Connect Your Own Domain</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>
                  In <strong>Settings → Pages</strong>, type your domain into the{" "}
                  <strong>Custom domain</strong> field.
                </li>
                <li>
                  Add the DNS records GitHub shows you at your registrar (four{" "}
                  <code className="bg-gray-100 px-1 rounded">A</code> records for a root domain, or
                  a <code className="bg-gray-100 px-1 rounded">CNAME</code> for a subdomain).
                </li>
                <li>Once the certificate is ready, check <strong>Enforce HTTPS</strong>.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Updating Your Site</h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Open your repo on GitHub.</li>
                <li>
                  Delete the old files and upload the new ones via{" "}
                  <strong>Add file → Upload files</strong>, or click a file and use the pencil icon
                  to edit it directly.
                </li>
                <li>Commit — GitHub Pages redeploys within a minute.</li>
              </ol>
            </div>
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center">
          Need help? Reach out through your Ziply dashboard and we&rsquo;ll get you sorted.
        </p>
      </div>
    </div>
  );
}
