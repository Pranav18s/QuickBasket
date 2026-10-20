# QuickBasket 2026 — Requirements

> **Status:** Draft — Phase 1 (Requirements & Architecture)
> **Last updated:** 2026-10-19

---

## 1. Purpose

QuickBasket 2026 is a portfolio-grade grocery-ordering website targeting customers in Edappal and Vattamkulam, Kerala, India. It demonstrates a complete full-stack implementation for a developer portfolio. Real inventory, fulfilment, and payments are **not** active in the initial release.

---

## 2. Stakeholders

| Role | Description |
|---|---|
| Portfolio Developer | Builds and maintains the project |
| Customer | Browses products, manages a cart, and places demo orders |
| Administrator | Manages products, categories, orders, and service areas |
| Future Shop Partner | Possible future real-world operator (out of scope now) |

---

## 3. Functional requirements

### 3.1 Customer — browsing

- **FR-C-01** Display a home page with featured products and promoted categories.
- **FR-C-02** List all active products with pagination or infinite scroll.
- **FR-C-03** Filter products by category, price range, and availability.
- **FR-C-04** Search products by name and description (keyword search).
- **FR-C-05** Display a product detail page with name, description, price, package size, and stock status.
- **FR-C-06** List products within a selected category.

### 3.2 Customer — cart

- **FR-C-10** Add a product to the cart from the product listing or detail page.
- **FR-C-11** Increase or decrease quantity of a cart item.
- **FR-C-12** Remove an item from the cart.
- **FR-C-13** Clear the entire cart.
- **FR-C-14** Persist the cart in the browser across page reloads.
- **FR-C-15** Show a running subtotal in the cart.

### 3.3 Customer — checkout and orders

- **FR-C-20** Allow manual entry of a delivery address (name, phone, street, locality, PIN code).
- **FR-C-21** Check whether the entered address falls within a configured demo service area.
- **FR-C-22** Show a clearly labelled demo checkout confirmation page.
- **FR-C-23** Submit a demo order (COD payment method only, initially).
- **FR-C-24** Show an order-success page with order ID and summary.
- **FR-C-25** List the customer's past orders.
- **FR-C-26** Show full detail for a specific past order including item snapshots.

### 3.4 Customer — account

- **FR-C-30** Register a new account with name, email, and password.
- **FR-C-31** Log in with email and password.
- **FR-C-32** Log out.
- **FR-C-33** View and edit profile (name, email).
- **FR-C-34** Restrict order history and checkout to authenticated users.

### 3.5 Admin — products

- **FR-A-01** List all products (including inactive).
- **FR-A-02** Create a new product with all required fields.
- **FR-A-03** Edit an existing product.
- **FR-A-04** Deactivate (soft-delete) a product; do not hard-delete to preserve order history.
- **FR-A-05** Upload or link a product image.

### 3.6 Admin — categories

- **FR-A-10** List, create, edit, and deactivate categories.

### 3.7 Admin — inventory

- **FR-A-15** View current stock levels for all products.
- **FR-A-16** Update stock quantity for a product.

### 3.8 Admin — orders

- **FR-A-20** List all orders with filters by status and date.
- **FR-A-21** View full order detail including customer info and item snapshots.
- **FR-A-22** Update order status (placed → confirmed → out_for_delivery → delivered / cancelled).

### 3.9 Admin — service areas

- **FR-A-30** List configured service areas.
- **FR-A-31** Add a new service area (name, PIN code, delivery fee).
- **FR-A-32** Enable or disable a service area.
- **FR-A-33** Delete a service area.

### 3.10 Admin — dashboard

- **FR-A-40** Display demo metrics: total orders, total revenue, product count, low-stock alerts.
- **FR-A-41** Label all dashboard metrics as demo data.

---

## 4. Non-functional requirements

### 4.1 Performance

- **NFR-P-01** Pages must load within a reasonable time on a broadband connection in local development.
- **NFR-P-02** API responses for product listings must return within 500 ms under normal load locally.

### 4.2 Security

- **NFR-S-01** Passwords must be hashed with bcrypt (cost factor ≥ 12) and never stored in plain text.
- **NFR-S-02** All admin API endpoints must enforce server-side role checks.
- **NFR-S-03** JWTs (or session tokens) must be stored in httpOnly cookies, not localStorage.
- **NFR-S-04** The application must not expose `.env` secrets to the browser or to the Git repository.
- **NFR-S-05** Rate limiting must be applied to authentication endpoints.
- **NFR-S-06** Request bodies must be validated on the server before processing.

### 4.3 Reliability

- **NFR-R-01** Stock decrement and order creation must use atomic database operations to reduce overselling.
- **NFR-R-02** The backend must re-validate prices and stock at order-creation time, ignoring client-supplied values.

### 4.4 Accessibility

- **NFR-A-01** Forms must have associated labels and appropriate ARIA attributes.
- **NFR-A-02** Colour contrast must meet WCAG AA for body text.
- **NFR-A-03** Interactive controls must be keyboard-navigable.

### 4.5 Responsiveness

- **NFR-RS-01** The UI must work on viewport widths from 375 px (mobile) to 1920 px (desktop).
- **NFR-RS-02** There is one responsive website; no separate mobile application is built.

### 4.6 Portability

- **NFR-PO-01** The full application stack must run locally using Docker Compose.
- **NFR-PO-02** Setup must be achievable by following the README alone.

---

## 5. Constraints

| ID | Constraint |
|---|---|
| CON-01 | JavaScript and JSX only. No TypeScript. |
| CON-02 | npm workspaces monorepo. |
| CON-03 | No paid cloud services without explicit approval. |
| CON-04 | No real payment gateway in the initial release. |
| CON-05 | No multi-vendor marketplace in the initial release. |
| CON-06 | INR pricing; monetary values stored as integer paise. |
| CON-07 | Target region is Edappal and Vattamkulam, Kerala, India. |

---

## 6. Out of scope (initial release)

- Real payment processing.
- SMS or push notifications.
- Multi-vendor / multi-shop support.
- Native mobile application.
- Live inventory sync with a physical shop.
- Deployment to cloud (planned for Phase 12).
- Internationalisation or Malayalam language support.

---

## 7. Assumptions

- A local MongoDB instance (or MongoDB via Docker) is available for development.
- Product images will initially be free stock images or placeholder images.
- Delivery fulfilment is not implemented; orders are demo-only.
- A single admin user will be seeded during database setup.
