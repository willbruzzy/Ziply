# Deploying Your Ziply Website

Congrats, you've got your Ziply ZIP! Now let's get it online. You don't need to be technical for this. Both options below are free, and most people can have a live website in under five minutes.

We'll walk through two ways to do it: **Netlify** (the easy drag-and-drop option) and **GitHub Pages** (a good pick if you already use GitHub). Pick whichever feels right, yyou can always switch later.

---

## What You Just Downloaded

When you open your ZIP, you'll see two files:

- `index.html` — this is your whole website. Every page, every word, every picture.
- `styles.css` — this is what makes it look pretty.

One nice thing: the images you uploaded in the wizard are already tucked inside `index.html`, so there's no separate image folder to worry about. Just these two files and you're good.

**First thing to do:** unzip the file. On Windows, right-click and pick *Extract All*. On a Mac, just double-click the ZIP. You should end up with a folder containing those two files.

---

## Option 1: Netlify (The Easiest Way)

If you just want your site online as fast as possible, go with Netlify. No signup required to get started, and it's all drag-and-drop.

### Get Your Site Online

1. Head over to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Open the folder where you unzipped your Ziply files.
3. Grab both files (`index.html` and `styles.css`) and drag them onto the Netlify page.
   - Or, if it's easier, just drag the whole folder onto the page.
4. Give it a few seconds. Netlify will hand you a live URL that looks something like `https://silly-penguin-12345.netlify.app`.
5. Click it! Your site is live.

### Make It Permanent

That first URL is temporary — it'll disappear in 24 hours unless you claim it. To keep it around:

1. On the deploy page, click **Claim your site**.
2. Sign up for a free Netlify account (email or GitHub both work).
3. That's it, your site is now permanent, and you've got a dashboard to manage it.

### Pick a URL

Don't love your random URL? Change it:

1. Open your site from the Netlify dashboard.
2. Click **Site configuration → Change site name**.
3. Type in something like `my-nonprofit`, and your URL becomes `https://my-nonprofit.netlify.app`.

### Hooking Up Your Own Domain

If you already own a domain (say, `mynonprofit.org`), you can use it instead:

1. In your dashboard, go to **Domain management → Add a domain**.
2. Type in your domain, and Netlify will walk you through the DNS settings you need to change at your domain registrar.
3. Netlify sets up HTTPS (the little padlock in the browser) for you automatically.

### Updating Your Site Down the Road

If you ever regenerate your site in Ziply with new content:

1. Unzip the new download.
2. Go to your site's **Deploys** tab in Netlify.
3. Drag the new files onto the page.
4. Done — your live site updates in seconds.

---

## Option 2: GitHub Pages

GitHub Pages is a nice choice if you're already comfortable on GitHub. It takes a couple more steps than Netlify, but nothing scary.

### What You'll Need

- A free GitHub account. If you don't have one yet: [https://github.com/signup](https://github.com/signup).

### Get Your Site Online

1. **Create a new repository.**
   - Click the **+** in the top-right of GitHub and pick **New repository**.
   - Give it a name, something like `my-nonprofit-site` works.
   - Make it **Public** (GitHub Pages needs this on the free plan).
   - Check the box to **Add a README file** so the repo isn't empty.
   - Click **Create repository**.

2. **Upload your Ziply files.**
   - On the repo's main page, click **Add file → Upload files**.
   - Drag `index.html` and `styles.css` into the upload area.
   - Scroll down and click **Commit changes**.

3. **Turn on GitHub Pages.**
   - Click the **Settings** tab at the top of your repo.
   - In the left sidebar, click **Pages**.
   - Under **Source**, pick **Deploy from a branch**.
   - Under **Branch**, pick `main` and `/ (root)`, then hit **Save**.

4. **Give it a minute.** GitHub usually takes 1–2 minutes to publish. Refresh the Pages settings page and you'll see a green banner with your URL — something like `https://your-username.github.io/my-nonprofit-site/`.

5. **Check it out.** Click your URL and make sure everything looks right.

### Hooking Up Your Own Domain

Want to use `mynonprofit.org` instead?

1. In **Settings → Pages**, type your domain into the **Custom domain** field.
2. Over at your domain registrar, add the DNS records GitHub shows you (four `A` records if you're using the main domain, or a `CNAME` if it's a subdomain like `www`).
3. Once the certificate is ready, check **Enforce HTTPS** to turn on the padlock.

### Updating Your Site Down the Road

Regenerated your site in Ziply? Here's how to push the update:

1. Open your repo on GitHub.
2. Either click `index.html` and hit the pencil icon to edit it, or just delete the old files and upload the new ones via **Add file → Upload files**.
3. Commit the changes — GitHub Pages will redeploy within a minute.

---

## Need a Hand?

If you get stuck, reach out through your Ziply dashboard and we'll help you out. You can also peek at the main [README](../ReadMe.md) for more info about the project.
