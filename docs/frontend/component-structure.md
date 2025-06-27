# Component Structure

This document outlines the component structure of the StayFinder frontend application, explaining how components are organized and how they work together.

## Component Organization

The components in StayFinder are organized into several categories:

```
src/components/
├── auth/           # Authentication-related components
├── bookings/       # Booking-related components
├── common/         # Shared utility components
├── forms/          # Form components and form-related utilities
├── layout/         # Layout components (headers, footers, etc.)
├── maps/           # Map and location components
├── properties/     # Property listing and detail components
├── reviews/        # Review components
├── ui/             # UI components (buttons, cards, etc.)
└── user/           # User profile components
```

## Component Hierarchy

The application follows a hierarchical component structure:

1. **Layout Components**: Define the overall structure of the page

    - MainLayout
    - DashboardLayout
    - AuthLayout
    - ErrorLayout
    - PrintLayout

2. **Page Components**: Represent individual pages in the application

    - HomePage
    - PropertyListPage
    - PropertyDetailPage
    - BookingPage
    - etc.

3. **Feature Components**: Implement specific features within pages

    - PropertySearch
    - BookingCalendar
    - ReviewList
    - etc.

4. **UI Components**: Reusable UI elements used across the application
    - Button
    - Card
    - Modal
    - etc.

## Core UI Components

### Button Component

The Button component is a customizable button with different variants:

```jsx
<Button
    variant="primary" // primary, secondary, outline, text
    size="md" // sm, md, lg
    onClick={handleClick}
    disabled={isLoading}
>
    Submit
</Button>
```

### Card Component

The Card component is used for displaying content in a card format:

```jsx
<Card>
    <Card.Header>Card Title</Card.Header>
    <Card.Body>Card content goes here</Card.Body>
    <Card.Footer>Card footer</Card.Footer>
</Card>
```

### Modal Component

The Modal component is used for displaying modal dialogs:

```jsx
<Modal isOpen={isModalOpen} onClose={closeModal} title="Modal Title">
    Modal content goes here
</Modal>
```

### Form Components

Form components are built using React Hook Form:

```jsx
<Form onSubmit={handleSubmit}>
    <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        validation={{ required: "Email is required" }}
    />
    <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        validation={{ required: "Password is required" }}
    />
    <Button type="submit">Submit</Button>
</Form>
```

## Feature Components

### PropertyCard

The PropertyCard component displays a property listing:

```jsx
<PropertyCard
    property={property}
    isFavorite={isFavorite}
    onFavoriteToggle={handleFavoriteToggle}
/>
```

### BookingCalendar

The BookingCalendar component allows users to select dates for booking:

```jsx
<BookingCalendar
    availableDates={availableDates}
    selectedDates={selectedDates}
    onDateChange={handleDateChange}
    minNights={1}
    maxNights={30}
/>
```

### ReviewList

The ReviewList component displays a list of reviews:

```jsx
<ReviewList
    reviews={reviews}
    propertyId={propertyId}
    canAddReview={canAddReview}
/>
```

## Layout Components

### MainLayout

The MainLayout component is used for public pages and user pages:

```jsx
<MainLayout>{/* Page content */}</MainLayout>
```

### DashboardLayout

The DashboardLayout component is used for host and admin pages:

```jsx
<DashboardLayout>{/* Dashboard content */}</DashboardLayout>
```

## Component Communication

Components in StayFinder communicate through several mechanisms:

1. **Props**: For parent-child communication
2. **Context**: For global state management
3. **Custom Hooks**: For shared logic and state
4. **Event Handlers**: For handling user interactions

## Styling Approach

Components are styled using Tailwind CSS with a consistent approach:

1. **Base Styles**: Applied to all instances of a component
2. **Variant Styles**: Applied based on component props
3. **Responsive Styles**: Applied based on screen size
4. **State Styles**: Applied based on component state (hover, focus, etc.)

## Best Practices

When working with components in StayFinder, follow these best practices:

1. **Component Composition**: Compose complex components from simpler ones
2. **Prop Validation**: Use PropTypes to validate component props
3. **Controlled Components**: Use controlled components for form elements
4. **Memoization**: Use React.memo for performance optimization
5. **Lazy Loading**: Use lazy loading for components that are not needed immediately

## Example: Property Detail Page

Here's an example of how components are composed to create the Property Detail Page:

```jsx
function PropertyDetailPage() {
    // State and data fetching logic

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb items={breadcrumbItems} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PropertyGallery images={property.images} />
                        <PropertyInfo property={property} />
                        <PropertyAmenities amenities={property.amenities} />
                        <PropertyRules rules={property.rules} />
                        <PropertyMap location={property.location} />
                        <ReviewSection
                            reviews={reviews}
                            propertyId={property._id}
                            canAddReview={canAddReview}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <BookingCard
                            property={property}
                            onBookNow={handleBookNow}
                        />
                        <HostCard host={property.host} />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
```
