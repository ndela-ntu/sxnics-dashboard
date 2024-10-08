/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hcgqaubltkhwikijvccr.supabase.co",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
