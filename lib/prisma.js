import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Suppress unhandled ErrorEvents from WebSocket/Neon disconnections
if (typeof process !== "undefined" && process.on) {
  process.on("unhandledRejection", (reason) => {
    if (reason && (reason.constructor?.name === "ErrorEvent" || reason.type === "error")) {
      console.warn("Resiliently handled unhandled WebSocket ErrorEvent:", reason?.message || reason?.type || "connection reset");
    }
  });
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  return new PrismaClient({
    adapter: new PrismaNeon(
      {
        connectionString,
      },
      {
        onPoolError: (err) => {
          console.warn("Neon pool connection notice (handled):", err?.message || err);
        },
        onConnectionError: (err) => {
          console.warn("Neon connection error notice (handled):", err?.message || err);
        },
      }
    ),
  });
}

function getPrismaInstance() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prisma.reviewGenerationSession &&
    globalForPrisma.prisma.customerReviewSubmission
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

const db = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaInstance();
    const val = client[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export { db, getPrismaInstance };
export default db;