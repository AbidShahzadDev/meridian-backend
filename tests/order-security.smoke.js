const assert = require("node:assert/strict");
const { PlaceCodOrderSchema, UpdateOrderStatusSchema } = require("../dist/validators/order.validation");
const { ChangePasswordSchema } = require("../dist/validators/auth.validation");

const validOrder = {
  paymentMethod: "cash_on_delivery",
  items: [{ productId: "product-1", quantity: 2 }],
  shippingAddress: {
    fullName: "Test Buyer",
    phoneNo: "+92 300 0000000",
    addressLine1: "1 Test Street",
    city: "Karachi",
    country: "Pakistan",
  },
};

assert.equal(PlaceCodOrderSchema.parse(validOrder).paymentMethod, "cash_on_delivery");
assert.equal(PlaceCodOrderSchema.safeParse({ ...validOrder, paymentMethod: "stripe" }).success, false);
assert.equal(PlaceCodOrderSchema.safeParse({
  ...validOrder,
  items: [{ productId: "product-1", quantity: 1 }, { productId: "product-1", quantity: 1 }],
}).success, false);
assert.equal(UpdateOrderStatusSchema.safeParse({ status: "paid" }).success, false);
assert.equal(ChangePasswordSchema.safeParse({
  currentPassword: "old-password",
  newPassword: "new-password",
  confirmPassword: "does-not-match",
}).success, false);

console.log("COD order and password validation checks passed.");
