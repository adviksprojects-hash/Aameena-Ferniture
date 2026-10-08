"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Server action to get the current authenticated user and their database role (ADMIN, MANAGER, USER)
 */
export async function getCurrentUserRole() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { authenticated: false, role: null, user: null };
    }

    const user = await currentUser();
    if (!user) {
      return { authenticated: false, role: null, user: null };
    }

    const email = user.emailAddresses?.[0]?.emailAddress;

    // Check in database by Clerk user ID
    let dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Fallback: check by email in case user was manually seeded/created earlier
    if (!dbUser && email) {
      dbUser = await db.user.findUnique({
        where: { email },
      });
      if (dbUser) {
        dbUser = await db.user.update({
          where: { id: dbUser.id },
          data: {
            clerkUserId: userId,
            imageUrl: user.imageUrl || dbUser.imageUrl,
            name: dbUser.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          },
        });
      }
    }

    // If new user, create record
    if (!dbUser && email) {
      const userCount = await db.user.count();
      // First account created in the system gets ADMIN access
      const initialRole = userCount === 0 ? "ADMIN" : "USER";

      dbUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          imageUrl: user.imageUrl,
          role: initialRole,
        },
      });
    }

    // Check if user is assigned in the Manager directory
    let role = dbUser?.role || "USER";
    if (role === "USER" && email) {
      const isManager = await db.manager.findFirst({
        where: {
          OR: [{ email }, { userId: dbUser?.id }],
        },
      });
      if (isManager) {
        role = "MANAGER";
        if (dbUser) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { role: "MANAGER" },
          });
        }
      }
    }

    return {
      authenticated: true,
      role,
      user: {
        id: dbUser?.id || userId,
        clerkUserId: userId,
        name: dbUser?.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: dbUser?.email || email,
        imageUrl: dbUser?.imageUrl || user.imageUrl,
        role,
      },
    };
  } catch (error) {
    console.error("Error in getCurrentUserRole:", error);
    return { authenticated: false, role: null, user: null, error: error.message };
  }
}
