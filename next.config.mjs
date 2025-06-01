/** @type {import('next').NextConfig} */
  
  
  const nextConfig = {
    env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_COLLECTION: process.env.MONGODB_COLLECTION,
    MONGODB_DB: process.env.MONGODB_DB,

    API_SECRET_KEY: process.env.API_SECRET_KEY,
    IGNORED_FIELDS: process.env.IGNORED_FIELDS,
    MONGODB_LISTCAT: process.env.MONGODB_LISTCAT,
    MONGODB_LISTSUBCAT: process.env.MONGODB_LISTSUBCAT,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_TABLE_IGNORE_LIST: process.env.NEXT_PUBLIC_TABLE_IGNORE_LIST


  },
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  export default nextConfig;
