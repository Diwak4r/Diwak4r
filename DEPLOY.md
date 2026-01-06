# 🚀 Deployment Guide (Clean URLs)

This guide will help you deploy your portfolio with **Clean URLs** (no `.html` at the end).

> **Why not GitHub Pages?**
> GitHub Pages forces URLs to look like `/about.html`. To get `/about`, we need a smarter host like Vercel or Netlify. Both are free.

---

## Option 1: Vercel (Recommended)
*Fast, easy, and works perfectly with the `vercel.json` file I created for you.*

1.  **Sign Up:** Go to [vercel.com](https://vercel.com/signup) and sign up with **GitHub**.
2.  **Add New Project:** Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository:**
    *   You will see your list of GitHub repos.
    *   Find **`Diwak4r`** (or your portfolio repo name) and click **Import**.
4.  **Configure:**
    *   Leave all settings as default.
    *   **Framework Preset:** It might say "Other" or "Static"—that's fine.
    *   **Root Directory:** `./` (default).
5.  **Deploy:** Click **Deploy**.
6.  **Done!**
    *   Vercel will give you a domain like `diwak4r.vercel.app`.
    *   Visit `/about` (without `.html`) and it will work!

---

## Option 2: Netlify
*Also an excellent choice. Works using the `_redirects` file I created.*

1.  **Sign Up:** Go to [netlify.com](https://www.netlify.com/) and sign up with **GitHub**.
2.  **Add New Site:** Click **"Add new site"** -> **"Import an existing project"**.
3.  **Connect to GitHub:** Click the GitHub button and authorize.
4.  **Pick Repository:** Search for and select your portfolio repo.
5.  **Deploy Settings:**
    *   **Build command:** (Leave empty).
    *   **Publish directory:** (Leave empty or set to `/`).
6.  **Deploy Site:** Click **Deploy**.
7.  **Done!**
    *   Netlify will give you a random URL (e.g., `silly-goose-123.netlify.app`).
    *   You can change this in **Site Settings** -> **Change site name**.

---

## verification
Once deployed, check your new URL:
- Go to `your-site.com/about` -> Should load About page.
- Go to `your-site.com/index.html` -> Should redirect to `/`.
