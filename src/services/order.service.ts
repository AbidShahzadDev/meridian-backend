import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors";
import { OrderListQuery, OrderStatus, PlaceCodOrderInput } from "../validators/order.validation";
import NotificationService from "./notification.service";

const orderInclude = {
  items: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

const adminOrderInclude = {
  ...orderInclude,
  user: { select: { id: true, username: true, firstName: true, lastName: true, email: true, phoneNo: true } },
} satisfies Prisma.OrderInclude;

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function shippingFee() {
  const fee = Number(process.env.COD_SHIPPING_FEE ?? 0);
  if (!Number.isFinite(fee) || fee < 0) throw new Error("COD_SHIPPING_FEE must be a non-negative number");
  return roundMoney(fee);
}

function orderNumber() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `COD-${day}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function placeCodOrder(userId: string, input: PlaceCodOrderInput) {
  const order = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { isActive: true } });
    if (!user) throw new NotFoundError("User not found");
    if (!user.isActive) throw new ForbiddenError("This account is disabled");

    const ids = input.items.map(({ productId }) => productId);
    const products = await tx.product.findMany({
      where: { id: { in: ids }, status: "active" },
      select: { id: true, title: true, slug: true, sku: true, featuredImage: true, price: true, salePrice: true, stock: true },
    });
    if (products.length !== ids.length) throw new BadRequestError("One or more products are unavailable");

    const byId = new Map(products.map((product) => [product.id, product]));
    const items = input.items.map(({ productId, quantity }) => {
      const product = byId.get(productId)!;
      if (product.stock < quantity) throw new BadRequestError(`Insufficient stock for ${product.title}`);
      const unitPrice = roundMoney(product.salePrice ?? product.price);
      return {
        productId: product.id,
        productName: product.title,
        productSlug: product.slug,
        sku: product.sku,
        image: product.featuredImage,
        unitPrice,
        quantity,
        lineTotal: roundMoney(unitPrice * quantity),
      };
    });

    // Conditional updates prevent two simultaneous checkouts from overselling stock.
    for (const item of items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, status: "active", stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) throw new BadRequestError(`Insufficient stock for ${item.productName}`);
    }

    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const deliveryFee = shippingFee();
    const address = input.shippingAddress;
    return tx.order.create({
      data: {
        orderNumber: orderNumber(),
        userId,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        currency: (process.env.STORE_CURRENCY || "PKR").trim().toUpperCase(),
        subtotal,
        shippingFee: deliveryFee,
        total: roundMoney(subtotal + deliveryFee),
        fullName: address.fullName,
        phoneNo: address.phoneNo,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        notes: input.notes,
        items: { create: items },
      },
      include: orderInclude,
    });
  });
  await NotificationService.notifyUser(userId, {
    type: "order_placed",
    title: "Order placed successfully",
    body: `Your COD order ${order.orderNumber} has been placed.`,
    data: { orderId: order.id, orderNumber: order.orderNumber, status: order.status },
  }).catch((error) => console.error("Unable to notify customer about new order:", error));
  return order;
}

export async function getMyOrders(userId: string, query: OrderListQuery) {
  const where = { userId, ...(query.status ? { status: query.status } : {}) };
  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.order.count({ where }),
  ]);
  return { items, pagination: { ...query, total, pages: Math.ceil(total / query.limit) } };
}

export async function getMyOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: orderInclude });
  if (!order) throw new NotFoundError("Order not found");
  return order;
}

export async function getOrders(query: OrderListQuery) {
  const where = query.status ? { status: query.status } : {};
  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, include: adminOrderInclude, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.order.count({ where }),
  ]);
  return { items, pagination: { ...query, total, pages: Math.ceil(total / query.limit) } };
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: adminOrderInclude });
  if (!order) throw new NotFoundError("Order not found");
  return order;
}

async function transitionOrder(tx: Prisma.TransactionClient, orderId: string, nextStatus: OrderStatus, userId?: string) {
  const order = await tx.order.findFirst({
    where: { id: orderId, ...(userId ? { userId } : {}) },
    include: { items: { select: { productId: true, quantity: true } } },
  });
  if (!order) throw new NotFoundError("Order not found");

  const currentStatus = order.status as OrderStatus;
  if (!transitions[currentStatus]?.includes(nextStatus)) {
    throw new BadRequestError(`Order cannot move from ${currentStatus} to ${nextStatus}`);
  }
  const updated = await tx.order.updateMany({
    where: { id: order.id, status: currentStatus },
    data: {
      status: nextStatus,
      ...(nextStatus === "delivered" ? { paymentStatus: "paid" } : {}),
      ...(nextStatus === "cancelled" ? { paymentStatus: "cancelled" } : {}),
    },
  });
  if (updated.count !== 1) throw new BadRequestError("Order status changed; reload and try again");

  if (nextStatus === "cancelled") {
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }
  return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: userId ? orderInclude : adminOrderInclude });
}

export async function cancelMyOrder(userId: string, orderId: string) {
  const order = await prisma.$transaction((tx) => transitionOrder(tx, orderId, "cancelled", userId));
  await notifyOrderStatus(order).catch((error) => console.error("Unable to notify customer about order cancellation:", error));
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.$transaction((tx) => transitionOrder(tx, orderId, status));
  await notifyOrderStatus(order).catch((error) => console.error("Unable to notify customer about order status:", error));
  return order;
}

async function notifyOrderStatus(order: { id: string; userId: string; orderNumber: string; status: string }) {
  const labels: Record<string, string> = {
    confirmed: "Order confirmed",
    processing: "Order is being prepared",
    shipped: "Order shipped",
    delivered: "Order delivered",
    cancelled: "Order cancelled",
  };
  const title = labels[order.status] || "Order status updated";
  const body = order.status === "delivered"
    ? `Your order ${order.orderNumber} has been delivered. Thank you for shopping with us.`
    : `Your order ${order.orderNumber} is now ${order.status}.`;
  return NotificationService.notifyUser(order.userId, {
    type: `order_${order.status}`,
    title,
    body,
    data: { orderId: order.id, orderNumber: order.orderNumber, status: order.status },
  });
}
