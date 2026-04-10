# it3030-paf-2026-smart-campus-group62
web platform to  manage facility and asset bookings

# Smart Campus Hub – Facilities & Assets Catalogue
## Overview
Smart Campus Hub is a university management system designed to support campus operations such as facilities management, bookings, maintenance, notifications, and user access.

This module focuses on the **Facilities & Assets Catalogue**, which manages bookable university resources.

## Features Implemented

### Admin Functions
- Add new resources
- Update existing resources
- Delete resources
- Search resources by type, capacity, and location
- View dashboard statistics:
  - Total Resources
  - Active Resources
  - Out of Service Resources
  - Equipment Count

### User Functions
- View all available resources
- Search resources by type, capacity, and location
- Book available resources
- Redirect unregistered users to login when trying to book
- Disable booking for out-of-service resources

### UI/UX Enhancements
- Colored status badges:
  - Green for `ACTIVE`
  - Red for `OUT_OF_SERVICE`
- Real-time validation messages in the resource form
- Responsive and user-friendly interface

## Resource Details
Each resource includes:
- Type
- Name
- Capacity
- Location
- Availability start time
- Availability end time
- Status
- Description

## Technologies Used
- **Frontend:** React.js, React Router, Axios, CSS
- **Backend:** Spring Boot, Spring Data JPA, Spring Security
- **Database:** MySQL

## API Endpoints
- `POST /api/resources` – Add resource
- `GET /api/resources` – Get all resources
- `GET /api/resources/{id}` – Get resource by ID
- `PUT /api/resources/{id}` – Update resource
- `DELETE /api/resources/{id}` – Delete resource
- `GET /api/resources/search` – Search resources

## Current Scope
This module currently supports full CRUD operations for resources, search functionality, admin dashboard statistics, and user-side facilities browsing with booking control.

## Future Improvements
- Resource image upload
- Availability-based “Available Now” indicator
- Advanced sorting options
- Resource detail popup/page

## Module
**Module A – Facilities & Assets Catalogue**
