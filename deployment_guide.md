# Hosting Guide: Ovalo Milk CMS

Your application is now ready for production. I have optimized the database connection using the **Prisma Driver Adapter**, ensuring it works perfectly in serverless environments like Vercel.

## Recommended Hosting: Vercel

Vercel is the best platform for Next.js. Follow these steps to host your app:

### 1. Push Code to GitHub
If you haven't already, push your code to a new GitHub repository:
```bash
git init
git add .
git commit -m "Ready for production"
git branch -M main
git remote add origin https://github.com/your-username/ovalo-cms.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New** -> **Project**.
3. Import your `ovalo-cms` repository.

### 3. Configure Environment Variables
In the Vercel dashboard, add the following Environment Variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...:6543/postgres?pgbouncer=true` | Use the **Pooling** URL from Supabase. |
| `DIRECT_URL` | `postgresql://...:5432/postgres` | Use the **Direct** URL from Supabase. |
| `PRISMA_CLI_MODE` | `true` | (Optional) Add this only if you want to run `prisma migrate` in Vercel. |

### 4. Build Settings
Vercel should automatically detect Next.js. However, ensure the **Install Command** includes generating the Prisma client:
- **Build Command**: `next build`
- **Install Command**: `npm install` (Vercel automatically runs `prisma generate` if it's in your `postinstall` script, which it is in your `package.json`).

## Database Management
Since you are using Supabase, you can manage your data directly from the Supabase dashboard. Your application will automatically connect and reflect any changes made there.

> [!TIP]
> **SSL REQUIRED**: Your connection strings already include `sslmode=require`. Ensure this remains to maintain a secure connection to Supabase.

> [!CAUTION]
> **EXPOSE NO SECRETS**: Never commit your `.env` file to GitHub. Vercel will safely manage these variables for you.
