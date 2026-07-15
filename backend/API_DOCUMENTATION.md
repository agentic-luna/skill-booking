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

## 2. System Health Check

### `GET /api/v1/health`

Comprehensive health check endpoint reporting database connectivity, process memory, system resources, and server uptime. No authentication required.

**Response Fields:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | `UP` \| `DEGRADED` | Overall system status |
| `timestamp` | DateTime | ISO 8601 response timestamp |
| `responseTimeMs` | Integer | Time taken to generate the health response |
| `server.uptime` | Number | Process uptime in seconds |
| `server.uptimeFormatted` | String | Human-readable uptime (e.g. `1h 30m 5s`) |
| `server.nodeVersion` | String | Node.js runtime version |
| `server.pid` | Integer | Process ID |
| `server.environment` | String | Current `NODE_ENV` value |
| `database.status` | `UP` \| `DOWN` | PostgreSQL connection status |
| `database.latencyMs` | Integer | DB ping latency in milliseconds |
| `database.error` | String (nullable) | Error message if DB is down |
| `memory.process.rss` | String | Resident Set Size (e.g. `128.50 MB`) |
| `memory.process.heapTotal` | String | Total V8 heap allocated |
| `memory.process.heapUsed` | String | V8 heap currently in use |
| `memory.process.external` | String | Memory used by C++ objects bound to JS |
| `memory.system.total` | String | Total system RAM |
| `memory.system.free` | String | Available system RAM |
| `memory.system.used` | String | Used system RAM |
| `memory.system.usagePercent` | String | RAM usage percentage (e.g. `71.9%`) |
| `system.platform` | String | OS platform (e.g. `linux`, `darwin`) |
| `system.arch` | String | CPU architecture (e.g. `x64`, `arm64`) |
| `system.hostname` | String | Machine hostname |
| `system.cpuCores` | Integer | Number of CPU cores |
| `system.loadAverage` | String[] | 1, 5, 15 minute load averages |

**Response Codes:** `200` — All systems UP, `503` — System DEGRADED (database down)

---

## 3. Entity Schemas

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
| `venueDetails` | JSON | Zoom link or physical address (dynamically mapped from Venue/Instructor tables) |
| `startTime` | DateTime | Scheduled start time |
| `totalSeats` | Integer | Total seat capacity |
| `availableSeats` | Integer | Currently available seats |
| `status` | String (Enum) | `PENDING`, `APPROVED`, `CANCELED` |
| `version` | Integer | Optimistic locking version number |
| `price` | Float | Cost per ticket in INR |
| `duration` | String | Human readable event duration (e.g. `2 hours`) |
| `category` | String | Specific course category (e.g. `technology`, `culinary`) |
| `instructorId` | String (UUID) | ID of the instructor (optional) |
| `venueId` | String (UUID) | ID of the venue (optional) |
| `instructor` | Object | Instructor details object |
| `venue` | Object | Venue details object |

### Instructor Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique instructor identifier |
| `name` | String | Full name of the instructor |
| `bio` | String | Biography / information |
| `photoUrl` | String | Photo URL |
| `companyName` | String | Associated company or organization name |
| `facebook` | String | Optional link |
| `instagram` | String | Optional link |
| `linkedin` | String | Optional link |

### Venue Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique venue identifier |
| `address` | String | Physical address of the venue |
| `meetingLink` | String | Optional virtual meeting link (e.g. Zoom) |


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

## 4. Authentication & User Profile API

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

## 5. Host Management & KYC API

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
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank",
  "upiId": "john@hdfc"
}
```

**Note:** `upiId` is optional. `accountHolderName`, `accountNumber`, `ifscCode`, and `upiId` are AES-encrypted before storage.

### 2b. Retrieve Host Bank Details (Decrypted)
`GET /api/v1/hosts/bank-details` *(Requires Bearer Header - HOST)*

Returns the decrypted bank account details for the authenticated host, for pre-populating edit forms. Sensitive fields are decrypted server-side and only returned on this endpoint — they are excluded from all other profile responses.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "hostProfileId": "uuid",
    "accountHolderName": "John Host",
    "accountNumber": "9876543210",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC Bank",
    "upiId": "john@hdfc",
    "updatedAt": "2026-07-12T07:00:00.000Z"
  }
}
```

Returns `data: null` if no bank details have been submitted yet.

### 2c. Update Host Bank Details
`PUT /api/v1/hosts/bank-details` *(Requires Bearer Header - HOST)*

Partially updates bank account details. Only provided fields are updated. All sensitive fields are re-encrypted.

### 3. Fetch Host Dashboard Analytics
`GET /api/v1/hosts/dashboard` *(Requires Bearer Header - HOST)*

Retrieves host dashboard financial aggregations, review ratings, monthly revenue trend for the last 6 months, weekly booking flow, and recent bookings.

**Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 1200.50,
    "heldEscrow": 450.00,
    "activeTicketSales": 12,
    "totalRevenue": 1650.50,
    "grossRevenue": 1650.50,
    "eventsCount": 4,
    "averageRating": 4.5,
    "monthlyRevenue": [
      { "month": "Jan", "earnings": 200.00 },
      { "month": "Feb", "earnings": 150.00 },
      { "month": "Mar", "earnings": 300.00 },
      { "month": "Apr", "earnings": 100.00 },
      { "month": "May", "earnings": 250.00 },
      { "month": "Jun", "earnings": 350.00 }
    ],
    "weeklyBookings": [
      { "day": "Mon", "bookings": 2 },
      { "day": "Tue", "bookings": 1 },
      { "day": "Wed", "bookings": 4 },
      { "day": "Thu", "bookings": 0 },
      { "day": "Fri", "bookings": 3 },
      { "day": "Sat", "bookings": 1 },
      { "day": "Sun", "bookings": 1 }
    ],
    "recentBookings": [
      {
        "id": "b3e34b12-4c22-4467-bc5b-432d56a23999",
        "createdAt": "2026-07-15T12:00:00.000Z",
        "status": "CONFIRMED",
        "amount": 75.00,
        "event": {
          "title": "Kalaripayattu Basics - Martial Arts"
        },
        "client": {
          "user": {
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "client@luna.com"
          }
        }
      }
    ]
  }
}
```

---

## 6. Event Discovery & Booking API

### 1. Create Host Event
`POST /api/v1/hosts/events` *(Requires Bearer Header - Approved HOST, KYC Status: APPROVED)*

**Requirements:** Host must have completed KYC and have `kycStatus = APPROVED` to create events.

**Request Body:**
```json
{
  "title": "Advanced NestJS Masterclass",
  "posterUrl": "https://example.com/poster.png",
  "mode": "ONLINE",
  "venueDetails": "https://zoom.us/j/999888",
  "startTime": "2026-07-10T10:00:00.000Z",
  "totalSeats": 20,
  "price": 149.99,
  "duration": "3 hours",
  "description": "A comprehensive deep-dive workshop on NestJS architecture, DI, guards, and interceptors.",
  "category": "technology"
}
```

**Field Reference:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | ✅ | Workshop title |
| `posterUrl` | String | ❌ | URL to the cover image |
| `mode` | `ONLINE` \| `OFFLINE` | ✅ | Delivery mode |
| `venueDetails` | String | ❌ | Venue address or streaming URL |
| `startTime` | ISO 8601 DateTime | ✅ | Workshop start date and time |
| `totalSeats` | Integer | ✅ | Maximum number of participants |
| `price` | Number (float) | ❌ | Ticket price in USD. Defaults to 0 |
| `duration` | String | ❌ | Human-readable duration (e.g. `3 hours`) |
| `description` | String | ❌ | Full workshop description and syllabus |
| `category` | String | ❌ | Domain category: `technology`, `design`, `fitness`, `culinary`, `business`, `photography` |

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

### 6. Get Active Boosted Events
`GET /api/v1/boosted-events`

Returns list of all active sponsored or boosted events.

---

## 7. Wishlist & Event Likes API

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

## 8. Reviews & Ratings API

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

## 9. User Notifications API

### 1. Get Notification Inbox
`GET /api/v1/notifications` *(Requires Bearer Header)*

### 2. Mark Notification as Read
`PUT /api/v1/notifications/:id/read` *(Requires Bearer Header)*

---

## 10. Webhook Integrations API

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

## 11. Admin Controls & Finance API

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

### 7. Soft-Delete Host
`DELETE /api/v1/admin/hosts/:id` *(Requires Bearer Header - SUPERADMIN)*

### 8. Send Direct Personal Notification to Host
`POST /api/v1/admin/hosts/:id/notify` *(Requires Bearer Header - SUPERADMIN)*

**Request Body:**
```json
{
  "subject": "Important Account Update",
  "bodyContent": "Please update your credentials."
}
```

### 9. Decline Workshop Listing
`PUT /api/v1/admin/events/:eventId/decline` *(Requires Bearer Header - SUPERADMIN)*

### 10. Get Refund Requests Queue
`GET /api/v1/admin/finance/refund-requests` *(Requires Bearer Header - SUPERADMIN)*

### 11. Approve Refund Request
`PUT /api/v1/admin/finance/refund-requests/:id/approve` *(Requires Bearer Header - SUPERADMIN)*

### 12. Decline Refund Request
`PUT /api/v1/admin/finance/refund-requests/:id/decline` *(Requires Bearer Header - SUPERADMIN)*

---

## 12. Host Features & Roster Board API

### 1. Update Profile Information
`PUT /api/v1/hosts/profile` *(Requires Bearer Header - Role-Agnostic)*

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@luna.com"
}
```

### 2. Change Password
`PUT /api/v1/hosts/change-password` *(Requires Bearer Header - Role-Agnostic)*

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123"
}
```

### 3. Apply as Verified Host
`POST /api/v1/hosts/apply-host` *(Requires Bearer Header - Role-Agnostic)*

**Request Body:**
```json
{
  "expertise": "Culinary Baking",
  "bio": "Certified senior culinary instructor."
}
```

### 4. Fetch Host's Own Events List
`GET /api/v1/hosts/my-events` *(Requires Bearer Header - HOST/SUPERADMIN)*

### 5. Fetch Roster Board Booking Aggregates
`GET /api/v1/hosts/participants` *(Requires Bearer Header - HOST/SUPERADMIN)*

### 6. Fetch Bookings for a Specific Host Event
`GET /api/v1/hosts/events/:eventId/bookings` *(Requires Bearer Header - HOST/SUPERADMIN)*

### 7. Update Pending Host Event Details
`PUT /api/v1/hosts/events/:id` *(Requires Bearer Header - HOST/SUPERADMIN)*

**Request Body:**
```json
{
  "title": "Advanced NestJS Masterclass (Updated)",
  "price": 600,
  "duration": "4 hours",
  "description": "An updated comprehensive course details..."
}
```

### 8. Delete Pending Host Event
`DELETE /api/v1/hosts/events/:id` *(Requires Bearer Header - HOST/SUPERADMIN)*

---

## 13. Client Booking Invoices API

### 1. Download Booking Invoice Statement (PDF)
`GET /api/v1/bookings/:bookingId/invoice` *(Requires Bearer Header - Client/Host/Admin)*
