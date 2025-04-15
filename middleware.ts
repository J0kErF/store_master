import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",                          // Home page
    "/collections(.*)",           // All collection pages
    "/search(.*)",                // Search pages
    "/product(.*)",               // Product pages
    "/api/:path*",                // Allow public API access if needed
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
