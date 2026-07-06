export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Skill Booking Platform API',
    description: 'Enterprise REST API specification for Synchronized Live-Streaming & Skill Booking Platform',
    version: '1.0.0',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Local Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token to access protected endpoints',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['SUPERADMIN', 'HOST', 'CLIENT'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          hostId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          posterUrl: { type: 'string' },
          mode: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
          venueDetails: { type: 'object', nullable: true },
          startTime: { type: 'string', format: 'date-time' },
          totalSeats: { type: 'integer' },
          availableSeats: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'CANCELED'] },
          version: { type: 'integer' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          bookingRef: { type: 'string' },
          clientId: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          seatCount: { type: 'integer' },
          totalAmount: { type: 'number' },
          status: { type: 'string', enum: ['INITIATED', 'CONFIRMED', 'CANCELED', 'REFUNDED'] },
        },
      },
      HostProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          accountType: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY'] },
          govIdUrl: { type: 'string' },
          gstNumber: { type: 'string', nullable: true },
          kycStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          bio: { type: 'string', nullable: true },
        },
      },
      Wishlist: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          event: { $ref: '#/components/schemas/Event' },
        },
      },
      EventLike: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          event: { $ref: '#/components/schemas/Event' },
        },
      },
      ClientProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          avatarUrl: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          country: { type: 'string', nullable: true },
        },
      },
      AdminProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          department: { type: 'string', nullable: true },
          adminLevel: { type: 'integer' },
          lastLoginIp: { type: 'string', nullable: true },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          bookingId: { type: 'string', format: 'uuid' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/integrations/twilio': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Setup Twilio SMS Integration',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment', 'accountSid', 'authToken', 'fromNumber'],
                properties: {
                  environment: { type: 'string', enum: ['TEST', 'LIVE'] },
                  accountSid: { type: 'string' },
                  authToken: { type: 'string' },
                  fromNumber: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Integration Configured' } }
      }
    },
    '/integrations/sendgrid': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Setup SendGrid Email Integration',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment', 'apiKey', 'fromEmail', 'fromName'],
                properties: {
                  environment: { type: 'string', enum: ['TEST', 'LIVE'] },
                  apiKey: { type: 'string' },
                  fromEmail: { type: 'string' },
                  fromName: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Integration Configured' } }
      }
    },
    '/integrations/meta-wa': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Setup Meta WhatsApp Integration',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment', 'accessToken', 'phoneNumberId', 'businessAccountId'],
                properties: {
                  environment: { type: 'string', enum: ['TEST', 'LIVE'] },
                  accessToken: { type: 'string' },
                  phoneNumberId: { type: 'string' },
                  businessAccountId: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Integration Configured' } }
      }
    },
    '/integrations/razorpay': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Setup Razorpay Payment Gateway',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment', 'keyId', 'keySecret', 'webhookSecret'],
                properties: {
                  environment: { type: 'string', enum: ['TEST', 'LIVE'] },
                  keyId: { type: 'string' },
                  keySecret: { type: 'string' },
                  webhookSecret: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Integration Configured' } }
      }
    },
    
    '/auth/otp/send': {
      post: {
        tags: ['Authentication'],
        summary: 'Request OTP verification code for email or phone',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['target', 'type'],
                properties: {
                  target: { type: 'string', example: 'user@luna.com' },
                  type: { type: 'string', enum: ['EMAIL', 'PHONE'], example: 'EMAIL' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'OTP sent successfully' } }
      }
    },
    '/auth/otp/verify': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify OTP code for email or phone',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['target', 'type', 'otp'],
                properties: {
                  target: { type: 'string', example: 'user@luna.com' },
                  type: { type: 'string', enum: ['EMAIL', 'PHONE'], example: 'EMAIL' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'OTP verified successfully' } }
      }
    },
    '/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'phone', 'password'],
                properties: {
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Client' },
                  email: { type: 'string', format: 'email', example: 'client@luna.com' },
                  phone: { type: 'string', example: '+15550201' },
                  password: { type: 'string', example: 'password123' },
                  emailOtp: { type: 'string', example: '123456' },
                  phoneOtp: { type: 'string', example: '654321' },
                  role: { type: 'string', enum: ['SUPERADMIN', 'HOST', 'CLIENT'], default: 'CLIENT' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully and token generated',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user using Email or Mobile Phone Number',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  identifier: { type: 'string', description: 'Registered Email or Mobile Phone Number', example: 'client@luna.com or +15550201' },
                  email: { type: 'string', format: 'email', example: 'client@luna.com' },
                  phone: { type: 'string', example: '+15550201' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful, returns JWT tokens and user profile',
          },
          400: {
            description: 'Invalid credentials or missing required fields',
          },
        },
      },
    },
    '/auth/forgot-password/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Request OTP verification code for Forgot Password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  identifier: { type: 'string', description: 'Registered Email or Mobile Phone', example: 'client@luna.com' },
                  email: { type: 'string', format: 'email', example: 'client@luna.com' },
                  phone: { type: 'string', example: '+15550201' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP sent successfully to registered email',
          },
          404: {
            description: 'No registered account found',
          },
        },
      },
    },
    '/auth/forgot-password/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify OTP code for Forgot Password and obtain resetToken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otp'],
                properties: {
                  identifier: { type: 'string', example: 'client@luna.com' },
                  email: { type: 'string', format: 'email', example: 'client@luna.com' },
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP verified successfully, returns 15-minute resetToken',
          },
          400: {
            description: 'Invalid or expired OTP',
          },
        },
      },
    },
    '/auth/forgot-password/reset': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password using verified resetToken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resetToken', 'newPassword'],
                properties: {
                  resetToken: { type: 'string', example: 'a1b2c3d4e5f6...' },
                  newPassword: { type: 'string', example: 'newPassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successfully',
          },
          400: {
            description: 'Invalid or expired reset token',
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate tokens and get a new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token rotated successfully, returns new access and refresh tokens',
          },
          401: {
            description: 'Token is invalid or has been revoked',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke refresh token and log out user session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged out successfully',
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Fetch the active authenticated user profile details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Returns profile data of the logged-in user',
          },
        },
      },
    },
    '/hosts/kyc': {
      post: {
        tags: ['Host Workflows'],
        summary: 'Submit KYC document profile verification details',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountType', 'govIdUrl'],
                properties: {
                  accountType: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY'] },
                  govIdUrl: { type: 'string', example: 'https://example.com/gov-id.pdf' },
                  gstNumber: { type: 'string', example: '22AAAAA0000A1Z5' },
                  bio: { type: 'string', example: 'Skill master class instructor' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'KYC details submitted' },
        },
      },
    },
    '/hosts/bank-details': {
      post: {
        tags: ['Host Workflows'],
        summary: 'Submit host bank account details (encrypted at rest)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName'],
                properties: {
                  accountHolderName: { type: 'string', example: 'John Host' },
                  accountNumber: { type: 'string', example: '9876543210' },
                  ifscCode: { type: 'string', example: 'LUNABANK01' },
                  bankName: { type: 'string', example: 'Luna Reserve Bank' },
                  upiId: { type: 'string', example: 'john@luna' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bank details submitted and encrypted' },
        },
      },
      put: {
        tags: ['Host Workflows'],
        summary: 'Update host bank account details (encrypted at rest)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  accountHolderName: { type: 'string' },
                  accountNumber: { type: 'string' },
                  ifscCode: { type: 'string' },
                  bankName: { type: 'string' },
                  upiId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Bank details updated successfully' },
        },
      },
    },
    '/hosts/events': {
      post: {
        tags: ['Host Workflows'],
        summary: 'Create a new skill booking event (enters PENDING status)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'posterUrl', 'mode', 'startTime', 'totalSeats'],
                properties: {
                  title: { type: 'string', example: 'Advanced NestJS Masterclass' },
                  posterUrl: { type: 'string', example: 'https://example.com/nestjs.png' },
                  mode: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
                  venueDetails: { type: 'object', example: { link: 'https://zoom.us/j/12345' } },
                  startTime: { type: 'string', format: 'date-time' },
                  totalSeats: { type: 'integer', example: 10 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event created and pending review' },
        },
      },
    },
    '/hosts/dashboard': {
      get: {
        tags: ['Host Workflows'],
        summary: 'Retrieve host dashboard financial aggregations',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns total earnings, held escrow, and ticket sales' },
        },
      },
    },
    '/events': {
      get: {
        tags: ['Client & Booking Workflows'],
        summary: 'Search and filter active approved events (Cached in Redis)',
        parameters: [
          { name: 'title', in: 'query', schema: { type: 'string' }, description: 'Search term for title' },
          { name: 'mode', in: 'query', schema: { type: 'string', enum: ['ONLINE', 'OFFLINE'] } },
          { name: 'hostId', in: 'query', schema: { type: 'string' } },
          { name: 'startTimeFrom', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'List of events' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Client & Booking Workflows'],
        summary: 'Fetch detailed view of a specific event',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event details' },
        },
      },
    },
    '/events/liked': {
      get: {
        tags: ['Client & Booking Workflows'],
        summary: 'Get all events liked by the authenticated client',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of liked events' },
        },
      },
    },
    '/events/{id}/like': {
      post: {
        tags: ['Client & Booking Workflows'],
        summary: 'Toggle like / unlike status for an event',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns toggled like state and updated like count' },
        },
      },
    },
    '/wishlist': {
      get: {
        tags: ['Client & Booking Workflows'],
        summary: 'Get client wishlist items',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns client wishlisted events' },
        },
      },
      post: {
        tags: ['Client & Booking Workflows'],
        summary: 'Add an event to client wishlist',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId'],
                properties: {
                  eventId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event added to wishlist' },
        },
      },
    },
    '/wishlist/{eventId}': {
      delete: {
        tags: ['Client & Booking Workflows'],
        summary: 'Remove an event from client wishlist',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event removed from wishlist' },
        },
      },
    },
    '/bookings/checkout': {
      post: {
        tags: ['Client & Booking Workflows'],
        summary: 'Initiate checkout session, lock tickets, and setup payment order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId', 'seatCount'],
                properties: {
                  eventId: { type: 'string', format: 'uuid' },
                  seatCount: { type: 'integer', example: 2 },
                  customAmount: { type: 'number', example: 1000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Returns checkout booking and Razorpay order payload' },
        },
      },
    },
    '/bookings/{bookingId}/cancel': {
      post: {
        tags: ['Client & Booking Workflows'],
        summary: 'Cancel ticket bookings and calculate refund dynamically using matrix',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Booking canceled/refunded and seats replenished' },
        },
      },
    },
    '/reviews': {
      post: {
        tags: ['Client & Booking Workflows'],
        summary: 'Submit a review and 1-5 star rating for an attended event',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId', 'bookingId', 'rating'],
                properties: {
                  eventId: { type: 'string', format: 'uuid' },
                  bookingId: { type: 'string', format: 'uuid' },
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'Outstanding NestJS Masterclass!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review submitted successfully' },
        },
      },
    },
    '/reviews/event/{eventId}': {
      get: {
        tags: ['Client & Booking Workflows'],
        summary: 'Fetch all reviews and rating statistics for an event',
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns reviews array and average rating statistics' },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notification Log Center'],
        summary: 'Fetch current users in-app notification history feed',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'In-app notification list' },
        },
      },
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notification Log Center'],
        summary: 'Mark specific in-app notification log as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Read state acknowledged' },
        },
      },
    },
    '/admin/login': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Dedicated Platform Superadmin Login Portal',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: 'admin@luna.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Superadmin authenticated, returns tokens and AdminProfile' },
          403: { description: 'Access denied - restricted to Superadmin role' },
        },
      },
    },
    '/admin/configs/integrations': {
      get: {
        tags: ['Admin Config & Controls'],
        summary: 'List active integrations configurations (secrets masked)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of integration configurations' },
        },
      },
    },
    '/admin/configs/integrations/{serviceName}': {
      put: {
        tags: ['Admin Config & Controls'],
        summary: 'Update credentials block for service, immediately invalidating cache',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'serviceName', in: 'path', required: true, schema: { type: 'string', enum: ['RAZORPAY', 'TWILIO', 'SENDGRID', 'META_WA'] } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment', 'credentials', 'isActive'],
                properties: {
                  environment: { type: 'string', enum: ['TEST', 'LIVE'] },
                  credentials: { type: 'object' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Configuration updated and cached' },
        },
      },
    },
    '/admin/configs/templates': {
      get: {
        tags: ['Admin Config & Controls'],
        summary: 'List all available SMS, Email, and WhatsApp templates',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of templates' },
        },
      },
    },
    '/admin/configs/templates/{templateId}': {
      put: {
        tags: ['Admin Config & Controls'],
        summary: 'Update bodyContent or properties of message templates',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'templateId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bodyContent: { type: 'string' },
                  subject: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Template updated successfully' },
        },
      },
    },
    '/admin/configs/platform': {
      get: {
        tags: ['Admin Config & Controls'],
        summary: 'Fetch global platform configurations (colors, refund matrix)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Global platform configurations' },
        },
      },
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Upsert global platform configurations',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'value'],
                properties: {
                  key: { type: 'string', example: 'refund_matrix' },
                  value: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Configuration upserted successfully' },
        },
      },
    },
    '/admin/logs/notifications': {
      get: {
        tags: ['Admin Config & Controls'],
        summary: 'Audit system-wide notifications logs (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'SENT', 'FAILED'] } },
        ],
        responses: {
          200: { description: 'Paginated logs list' },
        },
      },
    },
    '/admin/notifications/broadcast': {
      post: {
        tags: ['Admin Config & Controls'],
        summary: 'Broadcast manual custom notifications to a targeted cohort',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['channel', 'cohort', 'bodyContent'],
                properties: {
                  channel: { type: 'string', enum: ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'] },
                  cohort: { type: 'string', enum: ['ALL', 'HOSTS', 'CLIENTS', 'INDIVIDUAL'] },
                  targetUserId: { type: 'string', format: 'uuid', nullable: true },
                  triggerEvent: { type: 'string' },
                  subject: { type: 'string', nullable: true },
                  bodyContent: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Broadcast tasks enqueued' },
        },
      },
    },
    '/admin/events/queue': {
      get: {
        tags: ['Admin Moderation'],
        summary: 'List events requiring administrative physical verification calls',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Queue listing' },
        },
      },
    },
    '/admin/events/{eventId}/approve': {
      put: {
        tags: ['Admin Moderation'],
        summary: 'Approve pending events and lock platform commissions structure',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['commissionType', 'platformValue'],
                properties: {
                  commissionType: { type: 'string', enum: ['FIXED', 'PERCENTAGE'] },
                  platformValue: { type: 'number', example: 15 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Event approved and live' },
        },
      },
    },
    '/admin/finance/ledger': {
      get: {
        tags: ['Admin Moderation'],
        summary: 'Retrieve platform liabilities, realized earnings, and refund metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Ledger report' },
        },
      },
    },
    '/admin/finance/payouts/{hostId}': {
      put: {
        tags: ['Admin Moderation'],
        summary: 'Release held escrow funds to Host bank account via Razorpay transfer',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'hostId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Escrow released successfully' },
        },
      },
    },
    '/webhooks/razorpay': {
      post: {
        tags: ['Gateway Webhooks'],
        summary: 'Razorpay webhook callback capture payload listener',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event', 'payload'],
                properties: {
                  event: { type: 'string', example: 'payment.captured' },
                  payload: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Processed callback successfully' },
          202: { description: 'Webhook acknowledged with partial error warnings' },
        },
      },
    },
  },
};
export default swaggerSpec;
