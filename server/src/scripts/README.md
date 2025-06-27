# StayFinder Database Seeding Scripts

This directory contains scripts to seed the StayFinder database with dummy data for development and testing purposes.

## Available Scripts

### `seedUsers.js`

Seeds the database with sample user accounts including admins, hosts, and regular users.

```bash
node src/scripts/seedUsers.js
```

### `seedProperties.js`

Seeds the database with sample property listings. By default, it creates 50 properties with 90% of them located in India.

```bash
node src/scripts/seedProperties.js [count] [indianPercentage]
```

Parameters:

- `count` (optional): Number of properties to generate (default: 50)
- `indianPercentage` (optional): Percentage of properties that should be in India (default: 90)

Examples:

```bash
# Generate 50 properties with 90% in India (default)
node src/scripts/seedProperties.js

# Generate 100 properties with 90% in India
node src/scripts/seedProperties.js 100

# Generate 100 properties with 80% in India
node src/scripts/seedProperties.js 100 80
```

## Seeding Order

The scripts should be run in the following order:

1. First, seed users (required for property seeding):

    ```bash
    node src/scripts/seedUsers.js
    ```

2. Then, seed properties:
    ```bash
    node src/scripts/seedProperties.js
    ```

## Data Structure

### Users

The seed data includes:

- 1 admin user
- 8 host users from India (80%)
- 2 international host users (20%)
- 4 regular users (guests)

### Properties

The property seed data includes a variety of property types:

- Apartments
- Houses
- Condos
- Villas
- Cabins
- Cottages
- Hotels
- Other unique accommodations

Each property includes:

- Basic information (title, description, type)
- Pricing details (price, price period, optional fees)
- Property details (bedrooms, bathrooms, max guests)
- Location information (address, coordinates)
- Amenities
- Sample images
- House rules
- Ratings and review counts
- Availability and approval status

By default, 90% of properties are located in various cities across India, with the remaining 10% in international locations.

## Notes

- The seed scripts will delete existing data in the respective collections before adding new data.
- All passwords for seed users are set to `Password123!` (in the hashed form in the database).
- The image URLs are placeholders from Unsplash. In a production environment, you would use your own hosted images.
