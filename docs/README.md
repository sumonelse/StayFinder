# StayFinder Documentation

Welcome to the StayFinder documentation. This guide provides comprehensive information about the StayFinder application, its architecture, features, and how to set it up for development or production use.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture Overview](#architecture-overview)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)

## Introduction

StayFinder is a full-stack property rental application that allows users to find and book accommodations, hosts to list their properties, and administrators to manage the platform. The application is built with a modern tech stack including:

-   **Backend**: Node.js, Express.js, MongoDB
-   **Frontend**: React, React Router, TanStack Query, Tailwind CSS
-   **Authentication**: JWT-based authentication
-   **Image Storage**: Cloudinary
-   **Maps & Geocoding**: Leaflet

## Getting Started

For detailed setup instructions, please refer to:

-   [Backend Setup Guide](./backend/setup.md)
-   [Frontend Setup Guide](./frontend/setup.md)

## Architecture Overview

StayFinder follows a client-server architecture with a RESTful API:

-   [System Architecture](./architecture/overview.md)
-   [Database Schema](./architecture/database-schema.md)
-   [Authentication Flow](./architecture/authentication.md)

## Backend Documentation

-   [API Structure](./backend/api-structure.md)
-   [Models](./backend/models.md)
-   [Controllers](./backend/controllers.md)
-   [Middleware](./backend/middleware.md)
-   [Services](./backend/services.md)
-   [Utilities](./backend/utilities.md)
-   [Configuration](./backend/configuration.md)

## Frontend Documentation

-   [Component Structure](./frontend/component-structure.md)
-   [Routing](./frontend/routing.md)
-   [State Management](./frontend/state-management.md)
-   [API Integration](./frontend/api-integration.md)
-   [Styling Guide](./frontend/styling.md)
-   [Form Handling](./frontend/form-handling.md)

## API Reference

-   [Authentication Endpoints](./api/authentication.md)
-   [Property Endpoints](./api/properties.md)
-   [Booking Endpoints](./api/bookings.md)
-   [Review Endpoints](./api/reviews.md)
-   [User Endpoints](./api/users.md)
-   [Admin Endpoints](./api/admin.md)
-   [Upload Endpoints](./api/uploads.md)

## Deployment Guide

-   [Backend Deployment](./deployment/backend.md)
-   [Frontend Deployment](./deployment/frontend.md)
-   [Environment Configuration](./deployment/environment.md)
