# Authentication Flow

This document describes the authentication flow in the StayFinder application.

## Overview

StayFinder uses a JWT (JSON Web Token) based authentication system. This approach provides a stateless authentication mechanism that works well with RESTful APIs.

## Authentication Flow Diagram

```
┌─────────────┐                                  ┌─────────────┐                                  ┌─────────────┐
│             │                                  │             │                                  │             │
│    Client   │                                  │    Server   │                                  │  Database   │
│             │                                  │             │                                  │             │
└──────┬──────┘                                  └──────┬──────┘                                  └──────┬──────┘
       │                                                │                                                │
       │  1. Login Request (email, password)            │                                                │
       │ ─────────────────────────────────────────────► │                                                │
       │                                                │  2. Verify Credentials                         │
       │                                                │ ─────────────────────────────────────────────► │
       │                                                │                                                │
       │                                                │  3. User Data                                  │
       │                                                │ ◄───────────────────────────────────────────── │
       │                                                │                                                │
       │                                                │  4. Generate JWT                               │
       │                                                │     - User ID                                  │
       │                                                │     - Role                                     │
       │                                                │     - Expiration                               │
       │                                                │                                                │
       │  5. JWT Token + User Data                      │                                                │
       │ ◄───────────────────────────────────────────── │                                                │
       │                                                │                                                │
       │  6. Store JWT in Local Storage                 │                                                │
       │                                                │                                                │
       │                                                │                                                │
       │  7. API Request with JWT in Authorization Header                                                │
       │ ─────────────────────────────────────────────► │                                                │
       │                                                │  8. Verify JWT                                 │
       │                                                │     - Signature                                │
       │                                                │     - Expiration                               │
       │                                                │                                                │
       │                                                │  9. Get User Data                              │
       │                                                │ ─────────────────────────────────────────────► │
       │                                                │                                                │
       │                                                │  10. User Data                                 │
       │                                                │ ◄───────────────────────────────────────────── │
       │                                                │                                                │
       │  11. API Response                              │                                                │
       │ ◄───────────────────────────────────────────── │                                                │
       │                                                │                                                │
```

## Registration Process

1. **User Registration**:

    - User submits registration form with name, email, password, etc.
    - Server validates the input data
    - Server checks if the email is already registered
    - Server hashes the password using bcrypt
    - Server creates a new user record in the database
    - Server sends a verification email to the user (optional)
    - Server returns a success response

2. **Email Verification** (optional):
    - User receives an email with a verification link
    - User clicks the verification link
    - Server verifies the token in the link
    - Server updates the user's verification status
    - Server redirects the user to the login page

## Login Process

1. **User Login**:

    - User submits login form with email and password
    - Server validates the input data
    - Server retrieves the user record from the database
    - Server compares the provided password with the stored hash
    - If the credentials are valid, server generates a JWT
    - Server returns the JWT and user data to the client

2. **JWT Generation**:

    - JWT includes the following claims:
        - `sub`: User ID
        - `role`: User role (user, host, admin)
        - `iat`: Issued at timestamp
        - `exp`: Expiration timestamp
    - JWT is signed with a secret key

3. **Client-Side Storage**:
    - Client stores the JWT in local storage or a secure cookie
    - Client stores user data in application state (e.g., React Context)

## Authentication for API Requests

1. **Request Authentication**:

    - Client includes the JWT in the Authorization header of API requests:
        ```
        Authorization: Bearer <token>
        ```

2. **Server-Side Verification**:

    - Server extracts the JWT from the Authorization header
    - Server verifies the JWT signature using the secret key
    - Server checks if the JWT has expired
    - If the JWT is valid, server extracts the user ID and role
    - Server retrieves the user data from the database
    - Server attaches the user data to the request object
    - Server proceeds with the request handling

3. **Authorization**:
    - Server checks if the user has the required role for the requested resource
    - If the user is authorized, server processes the request
    - If the user is not authorized, server returns a 403 Forbidden response

## Token Refresh

To maintain user sessions without requiring frequent logins, StayFinder implements a token refresh mechanism:

1. **Token Expiration**:

    - JWTs have a limited lifetime (e.g., 7 days)
    - Client checks the token expiration before making API requests

2. **Token Refresh**:
    - When the token is about to expire, client sends a refresh request
    - Server verifies the current token
    - Server generates a new token with a new expiration
    - Server returns the new token to the client
    - Client updates the stored token

## Password Reset

For users who forget their passwords, StayFinder provides a password reset flow:

1. **Password Reset Request**:

    - User submits their email address
    - Server generates a password reset token
    - Server stores the token and its expiration in the user record
    - Server sends a password reset email with a link containing the token

2. **Password Reset**:
    - User clicks the link in the email
    - User enters a new password
    - Server verifies the token and its expiration
    - Server hashes the new password
    - Server updates the user's password and clears the reset token
    - Server returns a success response

## Logout Process

1. **Client-Side Logout**:

    - Client removes the JWT from local storage or cookie
    - Client clears user data from application state
    - Client redirects to the login page

2. **Server-Side Logout** (optional):
    - For enhanced security, the server can maintain a blacklist of invalidated tokens
    - When a user logs out, the token is added to the blacklist
    - The server checks the blacklist when verifying tokens

## Security Considerations

1. **Token Storage**:

    - JWTs should be stored securely on the client side
    - For web applications, use HttpOnly cookies or local storage with appropriate precautions

2. **HTTPS**:

    - All authentication-related communication should be over HTTPS

3. **Token Expiration**:

    - JWTs should have a reasonable expiration time
    - Long-lived tokens increase the risk of token theft

4. **CSRF Protection**:

    - Implement CSRF protection for cookie-based authentication

5. **Rate Limiting**:

    - Implement rate limiting for authentication endpoints to prevent brute force attacks

6. **Secure Password Storage**:
    - Passwords should be hashed using a strong algorithm (e.g., bcrypt)
    - Never store plain text passwords
