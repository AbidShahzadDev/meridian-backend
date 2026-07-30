import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import prisma from "../prisma/client";
import { NotificationDeviceInput, NotificationListQuery } from "../validators/notification.validation";

type NotificationInput = {
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

let messaging: Messaging | null | undefined;

function getFirebaseMessaging() {
  if (messaging !== undefined) return messaging;
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const app = getApps().length
      ? getApp()
      : initializeApp(clientEmail && privateKey
        ? { credential: cert({ projectId, clientEmail, privateKey }) }
        : { credential: applicationDefault(), ...(projectId ? { projectId } : {}) });
    messaging = getMessaging(app);
  } catch (error) {
    // Notification records still work when FCM credentials are not configured.
    messaging = null;
    console.warn("Firebase push notifications are disabled:", error instanceof Error ? error.message : error);
  }
  return messaging;
}

export async function registerDevice(userId: string, input: NotificationDeviceInput) {
  return prisma.notificationDevice.upsert({
    where: { token: input.token },
    update: { userId, platform: input.platform },
    create: { userId, token: input.token, platform: input.platform },
    select: { id: true, token: true, platform: true, createdAt: true, updatedAt: true },
  });
}

export async function unregisterDevice(userId: string, token: string) {
  await prisma.notificationDevice.deleteMany({ where: { userId, token } });
}

export async function listNotifications(userId: string, query: NotificationListQuery) {
  const where = { userId, ...(query.unreadOnly ? { readAt: null } : {}) };
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { items, unread, pagination: { ...query, total, pages: Math.ceil(total / query.limit) } };
}

export async function markRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { readAt: new Date() } });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}

async function persistNotifications(userIds: string[], input: NotificationInput) {
  if (!userIds.length) return [];
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type: input.type, title: input.title, body: input.body, data: input.data })),
  });
  return prisma.notificationDevice.findMany({ where: { userId: { in: userIds } }, select: { token: true } });
}

async function sendPush(tokens: string[], input: NotificationInput) {
  const client = getFirebaseMessaging();
  if (!client || !tokens.length) return;
  for (let offset = 0; offset < tokens.length; offset += 500) {
    const batch = tokens.slice(offset, offset + 500);
    const response = await client.sendEachForMulticast({
      tokens: batch,
      notification: { title: input.title, body: input.body },
      data: input.data,
      webpush: { fcmOptions: { link: "/notifications" } },
    });
    const invalidTokens = batch.filter((_token, index) => {
      const code = response.responses[index]?.error?.code;
      return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token";
    });
    if (invalidTokens.length) await prisma.notificationDevice.deleteMany({ where: { token: { in: invalidTokens } } });
  }
}

export async function notifyUsers(userIds: string[], input: NotificationInput) {
  const devices = await persistNotifications([...new Set(userIds)], input);
  await sendPush(devices.map(({ token }) => token), input).catch((error) => {
    console.error("Unable to send Firebase notification:", error instanceof Error ? error.message : error);
  });
}

export async function notifyUser(userId: string, input: NotificationInput) {
  return notifyUsers([userId], input);
}

export async function notifyAllActiveUsers(input: NotificationInput) {
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  return notifyUsers(users.map(({ id }) => id), input);
}

export default { registerDevice, unregisterDevice, listNotifications, markRead, markAllRead, notifyUsers, notifyUser, notifyAllActiveUsers };
