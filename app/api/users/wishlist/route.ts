import User from "@/lib/models/User";
import { connectToDB } from "@/lib/mongoDB";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ Allow all origins, or restrict to a list
const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

// ✅ Handle preflight requests
export const OPTIONS = async (req: NextRequest) => {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

export const POST = async (req: NextRequest) => {
  const origin = req.headers.get("origin");

  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: getCorsHeaders(origin),
      });
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        headers: getCorsHeaders(origin),
      });
    }

    const { productId } = await req.json();

    if (!productId) {
      return new NextResponse("Product Id required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    const isLiked = user.wishlist.includes(productId);

    if (isLiked) {
      user.wishlist = user.wishlist.filter((id: string) => id !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (err) {
    console.error("[wishlist_POST]", err);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
};
