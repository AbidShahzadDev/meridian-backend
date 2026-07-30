# Meridian API

## Secure store chatbot

The backend exposes the chatbot at `/api/chat` (and `/v1/chat`). It uses Google's official `@google/genai` SDK with Gemini function calling. The agent can search products, browse categories and featured/related products, read approved store/COD information, and—with authentication—read only the current customer's cart and orders. The browser never receives database or Gemini credentials.

Setup:

1. Revoke the credential previously shared outside the server and generate a new restricted Google AI Studio key.
2. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` to `.env` using `.env.example` as the template.
3. Edit the public store facts in `src/config/store-info.ts`.
4. Run `npx prisma migrate deploy` and then `npx prisma generate`.
5. Run `prisma/supabase-rls.sql` in Supabase SQL Editor for Data API defense in depth. The app's custom JWT is enforced by the Express API; it is separate from `auth.uid()` used by direct Supabase clients.
6. Add the widget to the storefront:

```html
<script src="https://YOUR_API_HOST/chat-widget/chat-widget.js" defer></script>
<store-chat api-base="https://YOUR_API_HOST"></store-chat>
```

Guests can ask about products, categories, recommendations, and store policies without logging in. For signed-in cart questions, define `window.StoreChatGetAccessToken` as a function that returns the current access JWT. If the callback has no token, return `null`; do not store the token inside the widget source.

Endpoints:

- `POST /api/chat/message` — `{ "message": "Show featured products" }`; authentication is optional unless the question asks about the cart.
- `POST /api/chat/message/stream` — streams SDK agent events as Server-Sent Events (`meta`, `tool`, `delta`, `done`, or `error`). The request accepts `{ "message": "...", "history": [{ "role": "user|model", "content": "..." }] }` with up to six complete turns.
- `GET /api/chat/products?search=&category=&limit=10`
- `GET /api/chat/categories`
- `GET /api/chat/featured-products?limit=10`
- `GET /api/chat/related-products/:productSlug?limit=10`
- `GET /api/chat/cart` — requires `Authorization: Bearer <access-token>`.

## Email verification during registration

Registration is now a two-step process:

1. `POST /v1/auth/register` with the normal registration fields. The API sends a six-digit OTP and creates no user until verification.
2. `POST /v1/auth/register/verify` with `{ "email": "buyer@example.com", "otp": "123456" }`. On success, the user is created and access/refresh tokens are returned.
3. `POST /v1/auth/register/resend-otp` with `{ "email": "buyer@example.com" }` to resend after the cooldown.

Codes are hashed in the database, expire after 10 minutes, allow five attempts, and have a resend cooldown. Configure `SENDER_EMAIL`, SES credentials, and a verified SES identity before testing delivery. Existing admin-seeded accounts do not need to verify again.

To use Supabase Auth to send the registration OTP instead of SES, configure the project URL and public/publishable key:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-supabase-publishable-key
AUTH_EMAIL_PROVIDER=supabase
```

Enable email OTP in Supabase Auth and configure custom SMTP for real users. Supabase's default email service is limited to authorized team addresses and low development rate limits; it is not intended for production delivery. The backend still creates the application's custom user and JWT after `verifyOtp` succeeds.

For local development only, `.env` can use:

```env
NODE_ENV=development
LOCAL_AUTH_OTP=000000
```

This skips SES and accepts `000000`. The bypass is disabled automatically when `NODE_ENV=production`; production always uses the emailed six-digit OTP.

## Cash on delivery orders

Authenticated buyers can place an order with `POST /v1/orders`. Product prices are read from the database, stock is deducted atomically, and payment remains pending until an admin marks the order delivered. Stripe is not involved in this flow.

```json
{
  "paymentMethod": "cash_on_delivery",
  "items": [{ "productId": "PRODUCT_ID", "quantity": 2 }],
  "shippingAddress": {
    "fullName": "Customer Name",
    "phoneNo": "+92 300 0000000",
    "addressLine1": "Street and house number",
    "city": "Karachi",
    "country": "Pakistan"
  },
  "notes": "Optional delivery note"
}
```

Buyer endpoints:

- `POST /v1/orders` — place a COD order.
- `GET /v1/orders/me` and `GET /v1/orders/me/:id` — view owned orders.
- `POST /v1/orders/me/:id/cancel` — cancel an order before shipping and restore stock.

Admin endpoints:

- `GET /v1/orders` and `GET /v1/orders/:id` — view all orders.
- `PATCH /v1/orders/:id/status` — advance an order through `confirmed`, `processing`, `shipped`, and `delivered`, or cancel it before shipping.
- `PUT /v1/auth/me/password` — change the signed-in account's own password.
- Admins can manage buyer accounts through `/v1/users`; super admins can also manage admin accounts.

Run `npx prisma migrate deploy` after deployment to create the order tables. Configure `STORE_CURRENCY` and `COD_SHIPPING_FEE` in the environment if their defaults (`PKR` and `0`) are not suitable.

## Firebase notifications

The API stores in-app notifications and sends web push notifications through Firebase Cloud Messaging. Configure Firebase Admin credentials on the server using `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`, or use `GOOGLE_APPLICATION_CREDENTIALS`. Never place a service-account private key in the browser or repository.

Authenticated frontend endpoints:

- `POST /v1/notifications/devices` — register an FCM token: `{ "token": "...", "platform": "web" }`.
- `DELETE /v1/notifications/devices` — unregister a token: `{ "token": "..." }`.
- `GET /v1/notifications?page=1&limit=20&unreadOnly=true` — read the user's notification inbox.
- `PATCH /v1/notifications/:id/read` — mark one notification read.
- `POST /v1/notifications/read-all` — mark all notifications read.

Notifications are generated for new products, order placement, order confirmation, processing, shipment, delivery, and cancellation. The Firebase browser configuration (`apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`) is public client configuration; the frontend additionally needs the Firebase Web Push certificate/VAPID key and a service worker for background notifications.
