import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";

export const checkUser = cache(async () => {
  try {
    const { userId } = await auth();

    // Fast exit if unauthenticated - avoids outbound Clerk API calls & DB roundtrips
    if (!userId) {
      return null;
    }

    let user = null;
    try {
      user = await currentUser();
    } catch (clerkErr) {
      console.warn("Clerk currentUser() lookup failed or timed out:", clerkErr?.message || clerkErr);
      return null;
    }

    if (!user) {
      return null;
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Customer";
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return null;
    }

    try {
      // Fast read check first to avoid heavy upsert write locks on every request
      const existing = await db.user.findUnique({
        where: { clerkUserId: user.id },
      });

      if (existing) {
        return existing;
      }

      const dbUser = await db.user.upsert({
        where: { clerkUserId: user.id },
        update: {
          name,
          email,
          imageUrl: user.imageUrl,
        },
        create: {
          clerkUserId: user.id,
          name,
          email,
          imageUrl: user.imageUrl,
        },
      });

      return dbUser;
    } catch (dbErr) {
      console.warn("Database user sync notice in checkUser:", dbErr?.message || dbErr);
      return {
        id: user.id,
        clerkUserId: user.id,
        name,
        email,
        imageUrl: user.imageUrl,
      };
    }
  } catch (error) {
    console.warn("Notice in checkUser (safely handled):", error?.message || error);
    return null;
  }
});
