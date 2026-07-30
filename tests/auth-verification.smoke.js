const assert = require("node:assert/strict");
const { AuthInputSchema, VerifyOTPSchema, ResendRegistrationOTPSchema } = require("../dist/validators/auth.validation");

const registration = {
  email: "buyer@example.com",
  phoneNo: "+923001234567",
  firstName: "Test",
  lastName: "Buyer",
  username: "testbuyer",
  profilePicture: "https://example.com/profile.png",
  password: "strong-password",
};

assert.equal(AuthInputSchema.safeParse(registration).success, true);
assert.equal(VerifyOTPSchema.safeParse({ email: registration.email, otp: "123456" }).success, true);
assert.equal(VerifyOTPSchema.safeParse({ email: registration.email, otp: "123" }).success, false);
assert.equal(VerifyOTPSchema.safeParse({ email: registration.email, otp: "0000" }).success, true);
assert.equal(ResendRegistrationOTPSchema.safeParse({ email: registration.email }).success, true);
console.log("Registration email verification validation checks passed.");
