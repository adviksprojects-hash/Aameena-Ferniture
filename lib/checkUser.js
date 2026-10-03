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

    const user = await currentUser();
    if (!user) {
      return null;
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Customer";
    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.warn("User does not have an email address");
      return null;
    }

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
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
});
