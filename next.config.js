/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hcgqaubltkhwikijvccr.supabase.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "sxnics-bucket.s3.eu-west-1.amazonaws.com",
        port: "",
      }
    ],
  },
};

module.exports = nextConfig;
