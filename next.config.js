/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // For Google profile pictures
        port: "",
        pathname: "**", // Allow any path under this hostname
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // For GitHub profile pictures
        port: "",
        pathname: "**", // Allow any path under this hostname
      },
      // Add any other external image hosts here if needed
    ],
  },
};

export default config;
