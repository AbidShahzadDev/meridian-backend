const assert = require("node:assert/strict");
const chat = require("../dist/services/chat.service");
const { optionalAuthenticateJWT } = require("../dist/middlewares/optional-auth.middleware");

function runOptionalAuth(headers = {}) {
  let nextCalled = false;
  let statusCode = 200;
  let responseBody;
  const req = { headers };
  const res = {
    status(code) { statusCode = code; return this; },
    json(body) { responseBody = body; return this; },
  };
  optionalAuthenticateJWT(req, res, () => { nextCalled = true; });
  return { nextCalled, statusCode, responseBody };
}

async function main() {
  const anonymous = runOptionalAuth();
  assert.equal(anonymous.nextCalled, true, "anonymous chat requests should pass optional authentication");
  assert.equal(anonymous.statusCode, 200);

  const cart = await chat.runChatTool("get_my_cart");
  assert.match(cart.error, /Authentication required/);
  const orders = await chat.runChatTool("get_my_orders");
  assert.match(orders.error, /Authentication required/);
  const store = await chat.runChatTool("get_store_information");
  assert.deepEqual(store.checkout.supported_payment_methods, ["cash_on_delivery"]);
  assert.ok(chat.chatAgentTools.some((tool) => tool.name === "search_products"));
  assert.ok(chat.chatAgentTools.some((tool) => tool.name === "get_my_orders"));
  console.log("Chat agent tool-boundary checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
