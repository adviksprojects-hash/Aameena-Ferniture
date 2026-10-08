import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";

/**
 * Server-side user synchronization helper
 * Ensures the Clerk authenticated user is cleanly synchronized into the PostgreSQL User table.
 */
export const checkUser = cache(async () => {
  try {
    const { userId } = await auth();

    // Fast exit if unauthenticated
    if (!userId) {
      return null;
    }

    let user = null;
    try {
      user = await currentUser();
    } catch (clerkErr) {
      console.warn("Clerk currentUser() lookup failed:", clerkErr?.message || clerkErr);
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
      // 1. Check if user already exists by Clerk User ID
      let existingUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
      });

      // 2. If not found by Clerk ID, check by email (handles pre-seeded or invited users)
      if (!existingUser) {
        existingUser = await db.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // Link existing email account to this Clerk ID
          existingUser = await db.user.update({
            where: { id: existingUser.id },
            data: {
              clerkUserId: user.id,
              name: existingUser.name || name,
              imageUrl: user.imageUrl || existingUser.imageUrl,
            },
          });
          return existingUser;
        }
      } else {
        // User exists with matching Clerk ID - update name/image if changed
        if (existingUser.name !== name || existingUser.imageUrl !== user.imageUrl) {
          existingUser = await db.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              imageUrl: user.imageUrl,
            },
          });
        }
        return existingUser;
      }

      // 3. Brand new user - Check if first user in database to grant initial ADMIN access
      const userCount = await db.user.count();
      const initialRole = userCount === 0 ? "ADMIN" : "USER";

      // Check if this email is pre-registered in the Manager directory
      const managerRecord = await db.manager.findFirst({
        where: { email },
      });
      const assignedRole = managerRecord ? "MANAGER" : initialRole;

      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          email,
          imageUrl: user.imageUrl,
          role: assignedRole,
        },
      });

      // If manager record exists, link user ID
      if (managerRecord && !managerRecord.userId) {
        await db.manager.update({
          where: { id: managerRecord.id },
          data: { userId: newUser.id },
        });
      }

      return newUser;
    } catch (dbErr) {
      console.error("Database user sync error in checkUser:", dbErr?.message || dbErr);
      return {
        id: user.id,
        clerkUserId: user.id,
        name,
        email,
        imageUrl: user.imageUrl,
      };
    }
  } catch (error) {
    console.error("Critical notice in checkUser:", error?.message || error);
    return null;
  }
});
