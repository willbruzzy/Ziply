# Ziply Frontend

This is the **Next.js 14** frontend for Ziply, a SaaS tool that helps nonprofits generate professional static websites and download them as ZIP files.

The backend API, data model, and deployment details are documented in the root `README.md` and `docs/`.

---

## Getting Started (Frontend Only)

From the `client/` directory:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

> Note: The Ziply backend must also be running (see root `README.md` for `npm run dev` from the project root).

---

## Environment Variables

Create `client/.env.local` (or copy from `.env.example`) and set:

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key used on the client |

For full environment configuration (including server-side values), see the root `README.md`.

---

## Related Documentation

- Root project overview and setup: `../ReadMe.md`
- Product & technical spec: `../docs/spec.md`
- Implementation plan: `../docs/plan.md`
