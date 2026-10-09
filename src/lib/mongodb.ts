import "server-only";
import { MongoClient, type Collection } from "mongodb";
import { ACTIVE_APPOINTMENT_STATUSES, type Appointment } from "@/types/appointment";
import type { Lead } from "@/types/lead";

/*
 * One MongoClient per server process. In development, Next.js reloads
 * modules on every change, so the client is cached on globalThis to avoid
 * opening a new connection pool each time.
 */
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: Promise<MongoClient>;
  _leadIndexes?: Promise<unknown>;
  _appointmentIndexes?: Promise<unknown>;
};

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  globalForMongo._mongoClient ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 5,
  })
    .connect()
    .catch((error) => {
      // Let the next request retry instead of caching a failed connection.
      globalForMongo._mongoClient = undefined;
      throw error;
    });
  return globalForMongo._mongoClient;
}

async function getDb() {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB ?? "a3ra");
}

export async function getLeadsCollection(): Promise<Collection<Lead>> {
  const leads = (await getDb()).collection<Lead>("leads");

  // createIndex is idempotent; run it once per process.
  globalForMongo._leadIndexes ??= Promise.all([
    leads.createIndex({ createdAt: -1 }),
    leads.createIndex({ status: 1, createdAt: -1 }),
    leads.createIndex({ ipHash: 1, createdAt: -1 }),
  ]).catch((error) => {
    globalForMongo._leadIndexes = undefined;
    throw error;
  });
  await globalForMongo._leadIndexes;

  return leads;
}

export async function getAppointmentsCollection(): Promise<Collection<Appointment>> {
  const appointments = (await getDb()).collection<Appointment>("appointments");

  globalForMongo._appointmentIndexes ??= Promise.all([
    // One active (requested/confirmed) booking per slot; cancelling frees it.
    appointments.createIndex(
      { slotStart: 1 },
      {
        name: "unique_active_slot",
        unique: true,
        partialFilterExpression: { status: { $in: ACTIVE_APPOINTMENT_STATUSES } },
      },
    ),
    appointments.createIndex({ status: 1, slotStart: 1 }),
    appointments.createIndex({ ipHash: 1, createdAt: -1 }),
  ]).catch((error) => {
    globalForMongo._appointmentIndexes = undefined;
    throw error;
  });
  await globalForMongo._appointmentIndexes;

  return appointments;
}
