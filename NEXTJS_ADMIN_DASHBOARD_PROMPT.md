# Next.js Admin Dashboard Integration Prompt

Build or update my Next.js admin dashboard so it integrates with my existing Meridian Express API and allows only `admin` and `super_admin` users to access dashboard pages.

## Stack

Use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, and Sonner. Use server components where appropriate and client components only for interactive UI.

## Backend contract

Use this server-only environment variable:

```env
BACKEND_API_URL=http://localhost:6543
```

Authentication endpoints:

- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `POST /v1/auth/refresh`
- `GET /v1/auth/me`

Admin login request:

```json
{
  "email": "admin@example.com",
  "password": "the-admin-password"
}
```

Successful login response:

```json
{
  "data": {
    "user": {
      "_id": "MongoDB user ID",
      "email": "admin@example.com",
      "username": "superadmin",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "super_admin",
      "isActive": true
    },
    "accessToken": "JWT access token",
    "refreshToken": "JWT refresh token"
  }
}
```

Refresh request:

```json
{
  "refreshToken": "refresh-token-value"
}
```

Every protected backend request requires:

```http
Authorization: Bearer ACCESS_TOKEN
```

Roles are `buyer`, `admin`, and `super_admin`. Only `admin` and `super_admin` can enter the dashboard. A `buyer` must be redirected to `/unauthorized`.

## Secure authentication architecture

Do not store access or refresh tokens in `localStorage` or expose them to client-side JavaScript. Implement a Next.js backend-for-frontend layer with Route Handlers:

- `POST /api/auth/login`: validate input, call the Express login endpoint, verify that the returned user role is `admin` or `super_admin`, and store both tokens in `httpOnly`, `secure` in production, `sameSite=lax` cookies.
- `POST /api/auth/logout`: delete both authentication cookies.
- `GET /api/auth/me`: read the access-token cookie and call the Express `/v1/auth/me` endpoint.
- Refresh the access token through `/v1/auth/refresh` when the API returns `401`, update both cookies, and retry the original request only once.
- Never return refresh tokens to browser components.
- Use generic login errors and do not reveal whether an email exists.

Create a server-only API helper that reads the access-token cookie and attaches the Bearer header. Proxy protected CRUD calls through Next.js Route Handlers so browser code never receives the JWT.

## Route protection

Protect all routes under `/dashboard`.

- Unauthenticated visitors go to `/login?callbackUrl=/dashboard`.
- Authenticated buyers go to `/unauthorized`.
- Admins and super admins may continue.
- Do not briefly render dashboard content before authorization finishes.
- Validate the session again in the dashboard server layout; middleware alone is not sufficient.
- Preserve a safe relative `callbackUrl` after login. Reject external callback URLs.

## Login page

Create `/login` with:

- Email and password inputs
- Show/hide password control
- Remember-me checkbox for cookie duration only
- Loading state that prevents duplicate submissions
- Field validation with Zod
- Accessible error alert
- Redirect to the validated callback URL after successful login
- Redirect an already authenticated admin to `/dashboard`

When the backend returns `401`, show “Invalid email or password.” When it returns `403`, show “This account is disabled or does not have dashboard access.”

## Dashboard APIs and permissions

Public read endpoints:

- `GET /v1/products`
- `GET /v1/products/:id`
- `GET /v1/categories`
- `GET /v1/categories/:id`
- `GET /v1/brands`
- `GET /v1/brands/:id`

Admin or super-admin protected mutations:

- `POST /v1/products`
- `PUT /v1/products/:id`
- `DELETE /v1/products/:id`
- `POST /v1/categories`
- `PUT /v1/categories/:id`
- `DELETE /v1/categories/:id`
- `POST /v1/brands`
- `PUT /v1/brands/:id`
- `DELETE /v1/brands/:id`

User administration:

- `GET /v1/users` allows `admin` and `super_admin`.
- `POST /v1/users`, `PUT /v1/users/:id`, and `DELETE /v1/users/:id` require `super_admin`.
- Hide user mutation controls from an `admin`, but still handle backend `403` responses.

## Dashboard UI

Create a responsive dashboard layout with sidebar, mobile navigation, top bar, breadcrumbs, logged-in user menu, role badge, and logout button.

Pages:

- `/dashboard`: counts for products, categories, brands, users, featured products, and low-stock products.
- `/dashboard/products`: searchable/filterable/paginated table with create, edit, view, and delete actions.
- `/dashboard/categories`: category CRUD with parent category selection.
- `/dashboard/brands`: brand CRUD.
- `/dashboard/users`: user list for both admin roles; create/edit/delete controls only for super admin.

Product list supports `page`, `limit`, `search`, `categoryId`, `brandId`, `status`, `isFeatured`, `minPrice`, `maxPrice`, `sort`, and `order` query parameters.

Match all forms to the backend validation schemas. Show loading skeletons, empty states, confirmation dialogs, field errors, API errors, success toasts, and retry actions. Invalidate the correct TanStack Query keys after mutations.

## Required files

Organize the implementation with files similar to:

```text
src/app/(auth)/login/page.tsx
src/app/unauthorized/page.tsx
src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/app/dashboard/products/page.tsx
src/app/dashboard/categories/page.tsx
src/app/dashboard/brands/page.tsx
src/app/dashboard/users/page.tsx
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/lib/api/server-client.ts
src/lib/auth/session.ts
src/lib/auth/permissions.ts
src/lib/validation/auth.ts
src/types/api.ts
middleware.ts
```

## Acceptance criteria

- Correct admin credentials open `/dashboard`.
- Buyer credentials never open `/dashboard`.
- Refreshing a protected page keeps a valid admin logged in.
- Expired access tokens are refreshed once; failed refresh clears cookies and redirects to login.
- Logout clears the session and prevents browser Back navigation from revealing protected data.
- Admin CRUD requests contain a valid Bearer token.
- `admin` cannot perform super-admin-only user mutations.
- Tokens never appear in localStorage, client logs, page HTML, or client-side API responses.
- The project passes TypeScript, ESLint, and production build checks.

Do not mock successful authentication or bypass role checks. Integrate the real API contract above and clearly report any backend response mismatch you discover.
