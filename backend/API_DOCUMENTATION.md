# Enterprise Backend API Documentation & Reference Manual

Welcome to the official API documentation for the **Skill Booking & Synchronized Live-Streaming Platform**.

- **Base URL**: `/api/v1`
- **Interactive Swagger UI**: Available at `http://localhost:4000/api-docs` (or your configured backend host)
- **Authentication**: Bearer Token (`Authorization: Bearer <JWT_ACCESS_TOKEN>`)

---

## 1. Core Architecture & Error Format

All API responses follow a unified response structure.

### Success Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Human readable error description",
    "code": "BadRequest | NotFound | Unauthorized | Forbidden | Conflict | TooManyRequests | InternalServerError"
  }
}
```

---

## 2. Entity Schemas

### User Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique user identifier |
| `role` | String (Enum) | `SUPERADMIN`, `HOST`, `CLIENT` |
| `firstName` | String | User's first name |
| `lastName` | String | User's last name |
| `email` | String | Registered email address |
| `phone` | String | Registered E.164 phone number |
| `status` | String (Enum) | `ACTIVE`, `SUSPENDED` |
| `createdAt` | DateTime | Timestamp of account creation |

### Event Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique event identifier |
| `hostId` | String (UUID) | Host user ID who created the event |
| `title` | String | Event title |
| `posterUrl` | String | Banner image URL |
| `mode` | String (Enum) | `ONLINE`, `OFFLINE` |
| `venueDetails` | JSON | Zoom link or physical address |
| `startTime` | DateTime | Scheduled start time |
| `totalSeats` | Integer | Total seat capacity |
| `availableSeats` | Integer | Currently available seats |
| `status` | String (Enum) | `PENDING`, `APPROVED`, `CANCELED` |
| `version` | Integer | Optimistic locking version number |

### Booking Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Booking ID |
| `bookingRef` | String | Unique human-readable reference (e.g. `BK-9NUPQ7H`) |
| `clientId` | String (UUID) | User ID of the client |
| `eventId` | String (UUID) | Event ID |
| `seatCount` | Integer | Number of seats booked |
| `totalAmount` | Decimal | Total price in INR |
| `status` | String (Enum) | `INITIATED`, `CONFIRMED`, `CANCELED`, `REFUNDED` |

### Transaction Ledger Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Ledger record ID |
| `bookingId` | String (UUID) | Associated booking ID |
| `amountCaptured` | Decimal | Amount captured from gateway |
| `platformRevenue` | Decimal | Locked platform commission revenue |
| `hostLiability` | Decimal | Escrow amount due to host |
| `status` | String (Enum) | `HELD`, `RELEASED_TO_HOST`, `REFUNDED_TO_CLIENT` |

---

## 3. Authentication & User Profile API

### 1. Request OTP Code
`POST /api/v1/auth/otp/send`

**Request Body:**
```json
{
  "target": "client@luna.com",
  "type": "EMAIL"
}
```

### 2. Verify OTP Code
`POST /api/v1/auth/otp/verify`

**Request Body:**
```json
{
  "target": "client@luna.com",
  "type": "EMAIL",
  "otp": "123456"
}
```

### 3. User Sign Up
`POST /api/v1/auth/signup`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Client",
  "email": "client@luna.com",
  "phone": "+15550201",
  "password": "password123",
  "role": "CLIENT",
  "emailOtp": "123456",
  "phoneOtp": "654321"
}
```

### 4. User Login (Email or Mobile Phone)
`POST /api/v1/auth/login`

**Request Body (by Email):**
```json
{
  "email": "client@luna.com",
  "password": "password123"
}
```
**Request Body (by Mobile Phone or Identifier):**
```json
{
  "identifier": "+15550201",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e11b4256-8c5a-4f96-9c07-43d3cdca7129",
      "firstName": "Jane",
      "lastName": "Client",
      "email": "client@luna.com",
      "phone": "+15550201",
      "role": "CLIENT",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### 5. Forgot Password - Send OTP
`POST /api/v1/auth/forgot-password/send-otp`

**Request Body:**
```json
{
  "identifier": "client@luna.com"
}
```

### 6. Forgot Password - Verify OTP
`POST /api/v1/auth/forgot-password/verify-otp`

**Request Body:**
```json
{
  "identifier": "client@luna.com",
  "otp": "916326"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "OTP verified successfully. You can now reset your password.",
    "resetToken": "4e73a08d...",
    "expiresInSeconds": 900
  }
}
```

### 7. Forgot Password - Reset Password
`POST /api/v1/auth/forgot-password/reset`

**Request Body:**
```json
{
  "resetToken": "4e73a08d...",
  "newPassword": "newSecretPassword123"
}
```

### 8. Refresh Token
`POST /api/v1/auth/refresh`

### 9. Logout
`POST /api/v1/auth/logout`

### 10. Get Current Profile
`GET /api/v1/auth/me` *(Requires Bearer Header)*

---

## 4. Host Management & KYC API

### 1. Submit Host KYC
`POST /api/v1/hosts/kyc` *(Requires Bearer Header - HOST)*

**Request Body:**
```json
{
  "accountType": "INDIVIDUAL",
  "govIdUrl": "https://example.com/gov-id.pdf",
  "bio": "Expert React and Node instructor"
}
```

### 2. Submit Host Bank Details
`POST /api/v1/hosts/bank-details` *(Requires Bearer Header - HOST)*

*(Data is AES-256 GCM encrypted at rest in PostgreSQL)*

**Request Body:**
```json
{
  "accountHolderName": "John Host",
  "accountNumber": "9876543210",
  "ifscCode": "LUNABANK01",
  "bankName": "Luna Reserve Bank",
  "upiId": "john@luna"
}
```

### 3. Fetch Host Dashboard Analytics
`GET /api/v1/hosts/dashboard` *(Requires Bearer Header - HOST)*

---

## 5. Event Discovery & Booking API

### 1. Create Host Event
`POST /api/v1/hosts/events` *(Requires Bearer Header - Approved HOST)*

**Request Body:**
```json
{
  "title": "Advanced NestJS Masterclass",
  "posterUrl": "https://example.com/poster.png",
  "mode": "ONLINE",
  "venueDetails": { "link": "https://zoom.us/j/999888" },
  "startTime": "2026-07-10T10:00:00.000Z",
  "totalSeats": 20
}
```

### 2. Search Events
`GET /api/v1/events?title=NestJS&mode=ONLINE` *(Cached via Redis)*

### 3. Get Event Details
`GET /api/v1/events/:id`

### 4. Initiate Booking Checkout
`POST /api/v1/bookings/checkout` *(Requires Bearer Header - CLIENT)*

**Request Body:**
```json
{
  "eventId": "242cfc2b-ba34-4fc2-9f31-84d0488001b1",
  "seatCount": 2,
  "customAmount": 1000.00
}
```

### 5. Get Client Bookings (My Bookings - Latest on top)
`GET /api/v1/bookings/my-bookings` (or `/api/v1/bookings/mybookings`) *(Requires Bearer Header - CLIENT)*

Returns all ticket bookings made by the authenticated client, ordered by creation date descending (latest bookings first).

### 5. Cancel Booking & Calculate Refund Matrix
`POST /api/v1/bookings/:bookingId/cancel` *(Requires Bearer Header)*

*Calculates refund percentage (>48h = 100%, 24-48h = 50%, <24h = 0%) and replenishes seat capacity.*

---

## 6. Wishlist & Event Likes API

### 1. Add Event to Wishlist
`POST /api/v1/wishlist` *(Requires Bearer Header - Policy: `client:wishlist_manage`)*

**Request Body:**
```json
{
  "eventId": "242cfc2b-ba34-4fc2-9f31-84d0488001b1"
}
```

### 2. Remove Event from Wishlist
`DELETE /api/v1/wishlist/:eventId` *(Requires Bearer Header - Policy: `client:wishlist_manage`)*

### 3. Get Client Wishlist
`GET /api/v1/wishlist` *(Requires Bearer Header - Policy: `client:wishlist_manage`)*

### 4. Toggle Event Like
`POST /api/v1/events/:eventId/like` *(Requires Bearer Header - Policy: `client:likes_manage`)*

### 5. Get Client Liked Events
`GET /api/v1/events/liked` *(Requires Bearer Header - Policy: `client:likes_manage`)*

---

## 7. Reviews & Ratings API

### 1. Submit Event Review
`POST /api/v1/reviews` *(Requires Bearer Header - CLIENT with confirmed booking)*

**Request Body:**
```json
{
  "eventId": "242cfc2b-ba34-4fc2-9f31-84d0488001b1",
  "bookingId": "booking-uuid",
  "rating": 5,
  "comment": "Outstanding course!"
}
```

### 2. Get Event Reviews
`GET /api/v1/reviews/event/:eventId`

---

## 7. User Notifications API

### 1. Get Notification Inbox
`GET /api/v1/notifications` *(Requires Bearer Header)*

### 2. Mark Notification as Read
`PUT /api/v1/notifications/:id/read` *(Requires Bearer Header)*

---

## 8. Webhook Integrations API

### Razorpay Webhook Callback
`POST /api/v1/webhooks/razorpay`

**Payload:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_test_transaction_99",
        "amount": 100000,
        "currency": "INR",
        "order_id": "BK-XKSA8IV",
        "notes": { "bookingRef": "BK-XKSA8IV" }
      }
    }
  }
}
```

---

## 9. Admin Controls & Finance API

### 1. Get Event Moderation Queue
`GET /api/v1/admin/events/queue` *(Requires Bearer Header - SUPERADMIN)*

### 2. Approve Event & Set Commission
`PUT /api/v1/admin/events/:id/approve` *(Requires Bearer Header - SUPERADMIN)*

**Request Body:**
```json
{
  "commissionType": "PERCENTAGE",
  "platformValue": 15
}
```

### 3. Get Platform Finance Ledger
`GET /api/v1/admin/finance/ledger` *(Requires Bearer Header - SUPERADMIN)*

### 4. Release Escrow Payout to Host
`PUT /api/v1/admin/finance/payouts/:hostUserId` *(Requires Bearer Header - SUPERADMIN)*

### 5. Boost Event
`POST /api/v1/boosted-events` *(Requires Bearer Header - SUPERADMIN)*

**Request Body:**
```json
{
  "eventId": "242cfc2b-ba34-4fc2-9f31-84d0488001b1",
  "priority": 1,
  "startDate": "2026-07-06T00:00:00Z",
  "endDate": "2026-07-13T00:00:00Z",
  "isActive": true
}
```

### 6. Setup Integration Provider Configs
`POST /api/v1/integrations/twilio` | `/sendgrid` | `/meta-wa` | `/razorpay`
