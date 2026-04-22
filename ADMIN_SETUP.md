# Admin Dashboard Setup Guide

## Overview

A complete admin dashboard has been built for the numeredecasa.ro e-commerce site, featuring:
- Orders management
- Customer reviews moderation
- Discount codes management
- Dashboard with KPIs and analytics

## Architecture Changes

### Route Group Structure
The app now uses Next.js route groups to separate the main site from admin:
- Main site pages: `src/app/(site)/` — includes Navbar, Footer, CartSidebar, CookieBanner
- Admin pages: `src/app/admin/` — clean layout without site chrome

This means URLs remain unchanged (e.g., `/produse` still works), but pages are organized logically.

## Authentication

### Admin Password Setup
1. Set the environment variable `ADMIN_PASSWORD` in your `.env.local`:
   ```bash
   ADMIN_PASSWORD=your-secure-password-here
   ```

2. The admin dashboard uses HTTP Basic Authentication:
   - Username: `admin`
   - Password: `$ADMIN_PASSWORD` (from env var)

3. To access: `https://your-domain.com/admin`
   - Browser will prompt for credentials
   - Enter username `admin` and your password

### Middleware Configuration
The middleware (`src/middleware.ts`) protects:
- All `/admin/*` routes (admin pages)
- All `/api/admin/*` routes (admin APIs)

It uses `matchers` to only check these paths, so public routes are unaffected.

## Admin Pages

### 1. Dashboard (`/admin`)
**Overview of key metrics and analytics:**
- **KPI Cards**: Total Revenue, Orders This Month, Payment Success Rate, Average Rating
- **Revenue Chart**: Last 30 days (CSS bar chart, no external libraries)
- **Recent Orders**: Last 10 orders with customer info
- **Order Status Breakdown**: Visual breakdown of order statuses
- **Discount Code Stats**: Total codes, active codes, total usage

**API Endpoint**: `GET /api/admin/stats`

### 2. Orders (`/admin/comenzi`)
**Manage all customer orders:**
- Search by customer name or email
- Filter by payment status (pending/paid/failed)
- Filter by order status (new/processing/shipped/delivered/completed/cancelled)
- Expandable order details showing:
  - Shipping address
  - Payment method and discount info
  - Order total and costs
  - Order status update dropdown

**API Endpoints**:
- `GET /api/admin/orders` — List all orders with items
- Uses existing `POST /api/orders/update-status` for status changes

### 3. Reviews (`/admin/recenzii`)
**Moderate customer reviews:**
- View all reviews with product type and rating
- Approve/reject reviews with one-click buttons
- Feature/unfeature reviews for homepage display
- Color-coded: pending (amber), approved (green)

**API Endpoints**:
- `GET /api/admin/reviews` — List all reviews
- `PUT /api/admin/reviews` — Update review approval/featured status

### 4. Discount Codes (`/admin/coduri-reducere`)
**Manage referral and promotional codes:**
- View active and inactive codes
- Toggle codes on/off
- See usage stats (times used / max uses)
- Copy code with one click
- View source customer and expiration dates

**API Endpoints**:
- `GET /api/admin/discount-codes` — List all codes
- `PUT /api/admin/discount-codes` — Toggle active status

## Admin API Routes

All admin API routes are in `src/app/api/admin/`:

### `GET /api/admin/stats`
Returns dashboard statistics:
```json
{
  "totalRevenue": 15000,
  "totalRevenueChange": 12.5,
  "ordersThisMonth": 25,
  "ordersThisMonthChange": 8.3,
  "paymentSuccessRate": 92.5,
  "paymentSuccessRateChange": 2.1,
  "averageRating": 4.6,
  "averageRatingChange": 0.1,
  "chartData": [{"date": "04/20", "revenue": 500}, ...],
  "recentOrders": [...],
  "statusBreakdown": {...},
  "discountCodeStats": {...}
}
```

### `GET /api/admin/orders`
Returns list of all orders with their items.

### `GET /api/admin/reviews`
Returns list of all reviews.

### `PUT /api/admin/reviews`
Update review status:
```json
{
  "reviewId": "uuid",
  "is_approved": true,
  "is_featured": false
}
```

### `GET /api/admin/discount-codes`
Returns list of all discount codes.

### `PUT /api/admin/discount-codes`
Toggle discount code active status:
```json
{
  "codeId": "uuid",
  "is_active": false
}
```

## Database Requirements

The admin dashboard expects these Supabase tables:

### `orders`
```sql
id (UUID, PK)
created_at (timestamp)
customer_first_name (text)
customer_last_name (text)
customer_email (text)
customer_phone (text)
shipping_address (text)
shipping_city (text)
shipping_county (text)
shipping_postal_code (text)
total_amount (decimal)
shipping_cost (decimal)
payment_status (text: pending/paid/failed)
payment_method (text)
order_status (text: new/processing/shipped/delivered/completed/cancelled)
discount_code (text, nullable)
discount_amount (decimal, nullable)
```

### `order_items`
```sql
id (UUID, PK)
order_id (UUID, FK → orders.id)
product_type (text: house/apartment/office)
quantity (integer)
unit_price (decimal)
customization_data (jsonb, nullable)
```

### `reviews`
```sql
id (UUID, PK)
created_at (timestamp)
order_id (UUID, FK → orders.id, nullable)
customer_name (text)
customer_email (text)
rating (integer: 1-5)
review_text (text)
product_type (text: house/apartment/office)
is_approved (boolean, default: false)
is_featured (boolean, default: false)
```

### `discount_codes`
```sql
id (UUID, PK)
created_at (timestamp)
code (text, unique)
discount_percent (decimal)
source_order_id (UUID, nullable)
source_customer_name (text, nullable)
source_customer_email (text, nullable)
is_active (boolean, default: true)
max_uses (integer, nullable)
times_used (integer, default: 0)
email_sent_at (timestamp, nullable)
expires_at (timestamp, nullable)
```

## Styling

The admin dashboard uses:
- **Tailwind CSS 4** with `@import "tailwindcss"` syntax
- **CSS Variables** from site theme: `--primary: #A0926B`, `--foreground: #1A1A1A`, `--background: #FDFCFA`
- **Dark Sidebar**: `#1A1A1A` background
- **Status Badges**: Color-coded (green/amber/red)
- **Charts**: Pure CSS, no external libraries

All styling is clean and modern with:
- Subtle shadows and rounded corners
- Hover states on tables
- Responsive design (mobile sidebar collapses)
- Dark theme for sidebar navigation

## Features

### Search & Filtering
- **Orders**: Search by name/email, filter by payment/order status
- **Reviews**: Show pending vs. approved, stats cards
- **Codes**: Show active vs. inactive with usage stats

### Data Display
- **Charts**: 30-day revenue chart using CSS bars
- **Tables**: Sortable, expandable rows, hover effects
- **Status Badges**: Color-coded for quick visual scanning

### One-Click Actions
- Approve/reject/feature reviews
- Toggle discount codes on/off
- Copy discount codes to clipboard
- Update order status from dropdown

### Analytics
- KPI cards with month-over-month change %
- Order status breakdown
- Payment success rate
- Average customer rating

## Environment Variables Required

```bash
# In .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-password

# Optional:
NEXT_PUBLIC_SITE_URL=https://numarul.ro (for email links)
```

## File Structure

```
src/
├── app/
│   ├── layout.tsx (root, minimal)
│   ├── middleware.ts (admin auth)
│   ├── admin/
│   │   ├── layout.tsx (dark sidebar)
│   │   ├── page.tsx (dashboard)
│   │   ├── comenzi/
│   │   │   └── page.tsx (orders)
│   │   ├── recenzii/
│   │   │   └── page.tsx (reviews)
│   │   └── coduri-reducere/
│   │       └── page.tsx (discount codes)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   ├── orders/
│   │   │   │   └── route.ts
│   │   │   ├── reviews/
│   │   │   │   └── route.ts
│   │   │   └── discount-codes/
│   │   │       └── route.ts
│   │   ├── orders/
│   │   │   └── update-status/ (existing)
│   │   └── (other existing APIs)
│   └── (site)/
│       ├── layout.tsx (with navbar/footer)
│       ├── page.tsx
│       ├── produse/
│       ├── checkout/
│       └── (all main site pages)
```

## Development

To test locally:

1. Ensure `ADMIN_PASSWORD` is set in `.env.local`
2. Run dev server: `npm run build && npm run start`
3. Navigate to `http://localhost:3000/admin`
4. Browser prompts for credentials:
   - Username: `admin`
   - Password: (your ADMIN_PASSWORD)
5. You should see the dashboard

## Production Deployment

1. Set `ADMIN_PASSWORD` in your production environment variables (Vercel, etc.)
2. The middleware will automatically protect `/admin` routes
3. All database queries use Supabase service role key (secure server-side)
4. No sensitive data is exposed to the client

## Security Notes

- **Authentication**: HTTP Basic Auth via middleware (requires HTTPS in production)
- **Database Access**: Uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to client)
- **API Routes**: Protected by middleware matcher, but also validate within route handlers
- **Environment**: Never expose `ADMIN_PASSWORD` or `SUPABASE_SERVICE_ROLE_KEY` in client code

## Troubleshooting

### Admin pages show 401 Unauthorized
- Check if `ADMIN_PASSWORD` is set in your environment
- Verify credentials: username is `admin`, password is the env var value
- Clear browser credentials and try again

### Orders not loading
- Check if `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Verify the `orders` table exists in Supabase with correct columns
- Check browser console for API error messages

### Sidebar not showing correctly on mobile
- The sidebar is responsive and collapses on screens < 768px
- Use the menu button (hamburger) to expand/collapse

## Future Enhancements

Possible additions:
- Customer management page
- Order export (CSV/PDF)
- Automated email campaigns
- Advanced analytics and reporting
- Bulk order status updates
- Custom discount code creation
- Revenue forecasting
