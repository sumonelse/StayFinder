import { amenities } from "./amenities.js"
import mongoose from "mongoose"
import {
    additionalIndianCities,
    additionalInternationalCities,
    additionalPropertyTitles,
    additionalPropertyDescriptions,
    additionalStreetNames,
    additionalRules,
} from "./additionalPropertyData.js"

/**
 * Helper function to get random items from an array
 * @param {Array} array - The array to select from
 * @param {Number} count - Number of items to select
 * @returns {Array} - Array of randomly selected items
 */
const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

/**
 * Helper function to get a random number between min and max (inclusive)
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} - Random number
 */
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Helper function to get a random floating point number between min and max
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @param {Number} decimals - Number of decimal places
 * @returns {Number} - Random floating point number
 */
const getRandomFloat = (min, max, decimals = 2) => {
    const rand = Math.random() * (max - min) + min
    return parseFloat(rand.toFixed(decimals))
}

/**
 * Helper function to get a random boolean with weighted probability
 * @param {Number} probabilityTrue - Probability of returning true (0-1)
 * @returns {Boolean} - Random boolean
 */
const getRandomBoolean = (probabilityTrue = 0.5) => {
    return Math.random() < probabilityTrue
}

/**
 * Helper function to get a random date between start and end
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} - Random date
 */
const getRandomDate = (start, end) => {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
}

// Indian cities with states
const indianCities = [
    { city: "Mumbai", state: "Maharashtra", coordinates: [72.8777, 19.076] },
    { city: "Delhi", state: "Delhi", coordinates: [77.1025, 28.7041] },
    { city: "Bangalore", state: "Karnataka", coordinates: [77.5946, 12.9716] },
    { city: "Hyderabad", state: "Telangana", coordinates: [78.4867, 17.385] },
    { city: "Chennai", state: "Tamil Nadu", coordinates: [80.2707, 13.0827] },
    { city: "Kolkata", state: "West Bengal", coordinates: [88.3639, 22.5726] },
    { city: "Pune", state: "Maharashtra", coordinates: [73.8567, 18.5204] },
    { city: "Jaipur", state: "Rajasthan", coordinates: [75.7873, 26.9124] },
    { city: "Ahmedabad", state: "Gujarat", coordinates: [72.5714, 23.0225] },
    {
        city: "Lucknow",
        state: "Uttar Pradesh",
        coordinates: [80.9462, 26.8467],
    },
    { city: "Kochi", state: "Kerala", coordinates: [76.2673, 9.9312] },
    { city: "Goa", state: "Goa", coordinates: [74.124, 15.2993] },
    { city: "Varanasi", state: "Uttar Pradesh", coordinates: [83.0, 25.3176] },
    {
        city: "Shimla",
        state: "Himachal Pradesh",
        coordinates: [77.1734, 31.1048],
    },
    {
        city: "Darjeeling",
        state: "West Bengal",
        coordinates: [88.2636, 27.041],
    },
    {
        city: "Rishikesh",
        state: "Uttarakhand",
        coordinates: [78.2676, 30.0869],
    },
    { city: "Amritsar", state: "Punjab", coordinates: [74.8723, 31.634] },
    { city: "Udaipur", state: "Rajasthan", coordinates: [73.7125, 24.5854] },
    { city: "Agra", state: "Uttar Pradesh", coordinates: [78.0081, 27.1767] },
    { city: "Mysore", state: "Karnataka", coordinates: [76.6394, 12.2958] },
]

// International cities
const internationalCities = [
    {
        city: "New York",
        state: "New York",
        country: "United States",
        coordinates: [-74.006, 40.7128],
    },
    {
        city: "London",
        state: "England",
        country: "United Kingdom",
        coordinates: [-0.1278, 51.5074],
    },
    {
        city: "Paris",
        state: "Île-de-France",
        country: "France",
        coordinates: [2.3522, 48.8566],
    },
    {
        city: "Tokyo",
        state: "Tokyo",
        country: "Japan",
        coordinates: [139.6917, 35.6895],
    },
    {
        city: "Sydney",
        state: "New South Wales",
        country: "Australia",
        coordinates: [151.2093, -33.8688],
    },
    {
        city: "Dubai",
        state: "Dubai",
        country: "United Arab Emirates",
        coordinates: [55.2708, 25.2048],
    },
    {
        city: "Singapore",
        state: "Singapore",
        country: "Singapore",
        coordinates: [103.8198, 1.3521],
    },
    {
        city: "Barcelona",
        state: "Catalonia",
        country: "Spain",
        coordinates: [2.1734, 41.3851],
    },
    {
        city: "Amsterdam",
        state: "North Holland",
        country: "Netherlands",
        coordinates: [4.9041, 52.3676],
    },
    {
        city: "Berlin",
        state: "Berlin",
        country: "Germany",
        coordinates: [13.405, 52.52],
    },
]

// Property titles for different types
const propertyTitles = {
    apartment: [
        "Modern Apartment with City Views",
        "Cozy Studio in the Heart of the City",
        "Luxury Apartment with Balcony",
        "Spacious Family Apartment",
        "Stylish Apartment Near Downtown",
        "Contemporary Apartment with Pool Access",
        "Elegant High-Rise Apartment",
        "Charming Apartment in Historic Building",
        "Bright and Airy Apartment",
        "Penthouse Apartment with Panoramic Views",
    ],
    house: [
        "Charming Family Home with Garden",
        "Spacious Villa with Private Pool",
        "Modern House in Quiet Neighborhood",
        "Traditional Home with Modern Amenities",
        "Luxury House with Stunning Views",
        "Cozy Bungalow Near the Beach",
        "Elegant Townhouse in Prime Location",
        "Family-Friendly House with Backyard",
        "Contemporary House with Garden",
        "Historic House with Character",
    ],
    condo: [
        "Luxury Condo with Ocean Views",
        "Modern Condo in Downtown",
        "Stylish Condo with Resort Amenities",
        "High-End Condo with City Skyline Views",
        "Spacious Condo Near Attractions",
        "Elegant Condo in Gated Community",
        "Contemporary Condo with Balcony",
        "Premium Condo with Pool Access",
        "Upscale Condo in Prime Location",
        "Chic Condo with Modern Decor",
    ],
    villa: [
        "Luxurious Villa with Private Pool",
        "Elegant Villa with Garden Views",
        "Spacious Villa for Family Getaways",
        "Modern Villa with Ocean Views",
        "Traditional Villa with Contemporary Touches",
        "Exclusive Villa in Gated Community",
        "Stunning Villa with Mountain Views",
        "Beachfront Villa with Direct Access",
        "Secluded Villa with Lush Surroundings",
        "Premium Villa with Outdoor Entertainment Area",
    ],
    cabin: [
        "Cozy Cabin in the Woods",
        "Rustic Cabin with Modern Amenities",
        "Charming Cabin Near Lake",
        "Secluded Cabin with Mountain Views",
        "Wooden Cabin with Fireplace",
        "Peaceful Cabin Retreat",
        "Traditional Cabin with Modern Comforts",
        "Scenic Cabin in Nature Reserve",
        "Quaint Cabin with Outdoor Deck",
        "Authentic Log Cabin Experience",
    ],
    cottage: [
        "Charming Cottage with Garden",
        "Cozy Cottage Near the Beach",
        "Historic Cottage with Modern Amenities",
        "Quaint Cottage in Peaceful Setting",
        "Traditional Cottage with Character",
        "Rustic Cottage with Fireplace",
        "Idyllic Cottage in Countryside",
        "Renovated Cottage with Original Features",
        "Picturesque Cottage with River Views",
        "Secluded Cottage Retreat",
    ],
    hotel: [
        "Boutique Hotel Room with City Views",
        "Luxury Hotel Suite with Balcony",
        "Modern Hotel Room in Prime Location",
        "Elegant Hotel Suite with Amenities",
        "Spacious Hotel Room Near Attractions",
        "Premium Hotel Suite with Lounge Area",
        "Contemporary Hotel Room with Workspace",
        "Deluxe Hotel Suite with Panoramic Views",
        "Stylish Hotel Room in Historic Building",
        "Executive Hotel Suite with Living Area",
    ],
    other: [
        "Unique Treehouse Experience",
        "Converted Barn with Modern Amenities",
        "Luxury Tent with Glamping Experience",
        "Historic Lighthouse with Ocean Views",
        "Converted Schoolhouse with Character",
        "Houseboat on Scenic Waterway",
        "Eco-Friendly Earth House",
        "Converted Windmill with Panoramic Views",
        "Luxury Yurt in Natural Setting",
        "Converted Church with Original Features",
    ],
}

// Property descriptions
const propertyDescriptions = {
    apartment: [
        "Experience urban living at its finest in this modern apartment. Featuring contemporary design, high-quality furnishings, and all the amenities you need for a comfortable stay. The apartment offers stunning city views and is conveniently located near public transportation, restaurants, and shopping centers. Perfect for business travelers or couples looking for a stylish city retreat.",
        "Welcome to our cozy and stylish apartment in the heart of the city. This thoughtfully designed space offers the perfect blend of comfort and convenience. With modern furnishings, a fully equipped kitchen, and a comfortable living area, you'll feel right at home. The location is unbeatable, with restaurants, cafes, and major attractions just steps away.",
        "Indulge in luxury living in this elegant apartment. Featuring high ceilings, large windows, and premium finishes throughout. The spacious layout includes a gourmet kitchen, comfortable living area, and a private balcony with breathtaking views. Located in a prestigious building with 24-hour security, fitness center, and rooftop terrace. Perfect for those seeking a sophisticated urban experience.",
    ],
    house: [
        "Welcome to our charming family home nestled in a peaceful neighborhood. This spacious house features a beautiful garden, comfortable living spaces, and all the amenities needed for a relaxing stay. With multiple bedrooms, a fully equipped kitchen, and outdoor entertaining areas, it's perfect for families or groups looking for a home away from home experience.",
        "Experience luxury living in this stunning modern house. Featuring contemporary architecture, high-end finishes, and thoughtfully designed spaces throughout. The open-concept living area flows seamlessly to the outdoor entertainment space and private garden. With multiple bedrooms, designer bathrooms, and premium amenities, this house offers the perfect blend of style and comfort.",
        "Step into this traditional home that combines classic charm with modern conveniences. The character-filled interior features wooden floors, high ceilings, and period details alongside contemporary furnishings and updated amenities. Enjoy the spacious living areas, fully equipped kitchen, and tranquil garden. Ideally located in a quiet neighborhood yet close to local attractions.",
    ],
    condo: [
        "Enjoy luxury living in this upscale condo with breathtaking views. This stylish unit features high-end finishes, modern appliances, and an open floor plan perfect for relaxing or entertaining. The building offers premium amenities including a fitness center, swimming pool, and 24-hour security. Located in a prime area with easy access to dining, shopping, and entertainment options.",
        "Welcome to our modern condo in the heart of downtown. This contemporary space offers the perfect urban retreat with its sleek design, quality furnishings, and thoughtful amenities. Enjoy the building's facilities including a rooftop terrace, fitness center, and resident lounge. Step outside to find yourself surrounded by the city's best restaurants, shops, and cultural attractions.",
        "Experience resort-style living in this elegant condo. The beautifully appointed interior features premium finishes, comfortable furnishings, and a private balcony with stunning views. Residents have access to world-class amenities including multiple swimming pools, spa facilities, fitness center, and concierge services. Perfectly positioned near beaches, dining, and entertainment options.",
    ],
    villa: [
        "Escape to this luxurious villa offering privacy and indulgence. The spacious interior features high ceilings, premium finishes, and elegant furnishings throughout. Outside, enjoy your private pool, landscaped garden, and outdoor dining area. With multiple bedrooms, a gourmet kitchen, and lavish living spaces, this villa provides the perfect setting for an unforgettable vacation.",
        "Welcome to our elegant villa nestled in a serene setting. This beautiful property combines traditional architecture with modern comforts to create a truly special retreat. The thoughtfully designed interior opens to a stunning outdoor area featuring a private pool, garden, and alfresco dining space. Perfect for families or groups seeking a private and luxurious getaway.",
        "Experience the ultimate in luxury at this exclusive villa. Set in a prestigious location, this property offers unparalleled privacy and comfort. The sophisticated interior includes spacious living areas, a gourmet kitchen, and sumptuous bedrooms. Step outside to your private paradise featuring a swimming pool, landscaped gardens, and outdoor entertainment areas with breathtaking views.",
    ],
    cabin: [
        "Escape to our cozy cabin nestled among towering trees. This charming retreat combines rustic elements with modern comforts to create the perfect woodland getaway. Inside, you'll find warm wooden interiors, a stone fireplace, and comfortable furnishings. The outdoor deck offers a peaceful setting for morning coffee or evening stargazing. Hiking trails and natural attractions are just steps away.",
        "Welcome to our authentic log cabin offering a true mountain experience. This carefully crafted retreat features traditional log construction with all the modern amenities needed for a comfortable stay. Enjoy the warmth of the wood-burning fireplace, prepare meals in the fully equipped kitchen, and relax on the covered porch surrounded by nature. Perfect for those seeking a peaceful escape.",
        "Experience tranquility in our secluded cabin retreat. This charming property offers the perfect balance of rustic charm and modern convenience. The interior features wooden beams, comfortable furnishings, and panoramic windows showcasing the surrounding landscape. Outside, enjoy the private deck, fire pit, and direct access to nature trails. An ideal base for outdoor adventures or peaceful relaxation.",
    ],
    cottage: [
        "Step into our charming cottage filled with character and comfort. This delightful property features traditional elements like exposed beams and a fireplace alongside modern amenities for a comfortable stay. The beautiful garden offers a tranquil space to relax and enjoy nature. Located in a picturesque setting yet convenient to local attractions and amenities.",
        "Welcome to our idyllic cottage nestled in a peaceful setting. This lovingly restored property combines original features with contemporary comforts to create a truly special retreat. Inside, you'll find cozy living spaces, a fully equipped kitchen, and comfortable bedrooms. The private garden offers the perfect spot for outdoor dining or simply enjoying the tranquil surroundings.",
        "Experience the charm of our historic cottage updated with modern conveniences. This characterful property features original architectural details alongside thoughtful renovations for today's lifestyle. Enjoy the cozy interior with its comfortable furnishings and well-equipped kitchen. Outside, the beautiful garden provides a serene space for relaxation. Perfectly positioned for exploring the surrounding area.",
    ],
    hotel: [
        "Enjoy the perfect blend of comfort and convenience in our boutique hotel room. This stylishly appointed space features premium bedding, modern amenities, and thoughtful touches to enhance your stay. Guests have access to the hotel's facilities including restaurant, fitness center, and concierge services. The central location puts you steps away from major attractions, dining, and shopping options.",
        "Indulge in luxury at our premium hotel suite. This spacious accommodation features elegant décor, high-quality furnishings, and a private balcony with stunning views. The suite includes a comfortable bedroom, separate living area, and modern bathroom with premium toiletries. Take advantage of the hotel's world-class amenities including spa, swimming pool, and fine dining restaurant.",
        "Experience sophisticated comfort in our executive hotel suite. This thoughtfully designed space offers the perfect environment for both relaxation and productivity. The suite features a plush bedroom, separate living area, and well-appointed bathroom. Guests enjoy access to exclusive amenities including lounge access, personalized concierge service, and premium dining options. Ideally located for business and leisure travelers.",
    ],
    other: [
        "Experience a truly unique stay in our one-of-a-kind accommodation. This extraordinary property offers an unforgettable experience with its distinctive architecture, thoughtful design, and special features. Inside, you'll find comfortable living spaces equipped with all the modern amenities needed for a pleasant stay. The surrounding area offers beautiful views and plenty of opportunities for exploration and adventure.",
        "Welcome to our converted historic building that combines original character with contemporary comfort. This special property preserves authentic architectural elements while incorporating modern amenities for today's lifestyle. The thoughtfully designed interior offers comfortable living spaces, quality furnishings, and unique features that reflect the building's heritage. An unforgettable base for your next getaway.",
        "Discover the magic of staying in our unique accommodation. This extraordinary property offers a one-of-a-kind experience that goes beyond the ordinary hotel or rental. The carefully crafted interior provides all the comforts you need while maintaining the special character that makes this place so distinctive. Surrounded by beautiful scenery and located in a desirable area, this is truly a stay to remember.",
    ],
}

// Sample image URLs from Unsplash
const sampleImageUrls = [
    // Exterior views
    {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        caption: "Exterior view",
    },
    {
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
        caption: "Modern house exterior",
    },
    {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        caption: "Luxury villa exterior",
    },
    {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        caption: "Beautiful property view",
    },
    {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
        caption: "Front view of the property",
    },
    {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        caption: "Property entrance",
    },
    {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        caption: "Scenic property view",
    },

    // Living rooms
    {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        caption: "Living room",
    },
    {
        url: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a",
        caption: "Spacious living area",
    },
    {
        url: "https://images.unsplash.com/photo-1618219944342-824e40a13285",
        caption: "Cozy living space",
    },
    {
        url: "https://images.unsplash.com/photo-1616137466211-f939a420be84",
        caption: "Modern living room",
    },
    {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
        caption: "Elegant living area",
    },
    {
        url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab",
        caption: "Comfortable lounge area",
    },

    // Kitchens
    {
        url: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8",
        caption: "Kitchen",
    },
    {
        url: "https://images.unsplash.com/photo-1556911220-bff31c812dba",
        caption: "Modern kitchen",
    },
    {
        url: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d",
        caption: "Fully equipped kitchen",
    },
    {
        url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a",
        caption: "Spacious kitchen area",
    },
    {
        url: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4",
        caption: "Elegant kitchen design",
    },

    // Bedrooms
    {
        url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d",
        caption: "Bedroom",
    },
    {
        url: "https://images.unsplash.com/photo-1617325247661-675ab4b64b72",
        caption: "Master bedroom",
    },
    {
        url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
        caption: "Cozy bedroom",
    },
    {
        url: "https://images.unsplash.com/photo-1616048056617-93b94a339009",
        caption: "Comfortable sleeping area",
    },
    {
        url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39",
        caption: "Stylish bedroom",
    },
    {
        url: "https://images.unsplash.com/photo-1616627561950-9f746e330187",
        caption: "Guest bedroom",
    },

    // Bathrooms
    {
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
        caption: "Bathroom",
    },
    {
        url: "https://images.unsplash.com/photo-1620626011761-996317b8d101",
        caption: "Modern bathroom",
    },
    {
        url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da",
        caption: "Elegant bathroom",
    },
    {
        url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14",
        caption: "Spacious bathroom",
    },
    {
        url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd",
        caption: "Luxury bathroom",
    },

    // Dining areas
    {
        url: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab",
        caption: "Dining area",
    },
    {
        url: "https://images.unsplash.com/photo-1617806118233-18e1de247200",
        caption: "Elegant dining space",
    },
    {
        url: "https://images.unsplash.com/photo-1615968679312-9b7ed9f04e79",
        caption: "Modern dining area",
    },
    {
        url: "https://images.unsplash.com/photo-1594568284297-7e64b2c85d8a",
        caption: "Spacious dining room",
    },

    // Balconies and views
    {
        url: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8",
        caption: "Balcony view",
    },
    {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        caption: "Scenic balcony",
    },
    {
        url: "https://images.unsplash.com/photo-1540544660406-6a69dacb2804",
        caption: "Panoramic view",
    },
    {
        url: "https://images.unsplash.com/photo-1528913775512-624d24b27b96",
        caption: "City view",
    },
    {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        caption: "Mountain view",
    },

    // Swimming pools
    {
        url: "https://images.unsplash.com/photo-1560449752-3fd74f5f509c",
        caption: "Swimming pool",
    },
    {
        url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd",
        caption: "Private pool",
    },
    {
        url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7",
        caption: "Luxury pool area",
    },
    {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
        caption: "Infinity pool",
    },
    {
        url: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc",
        caption: "Resort-style pool",
    },

    // Gardens and outdoor spaces
    {
        url: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1",
        caption: "Garden",
    },
    {
        url: "https://images.unsplash.com/photo-1558521958-0a228e77fc99",
        caption: "Lush garden",
    },
    {
        url: "https://images.unsplash.com/photo-1551410224-699683e15636",
        caption: "Beautiful landscaping",
    },
    {
        url: "https://images.unsplash.com/photo-1584622781867-bc4bd54a42a1",
        caption: "Outdoor area",
    },
    {
        url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
        caption: "Outdoor lounge",
    },
    {
        url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
        caption: "Patio space",
    },

    // Special features
    {
        url: "https://images.unsplash.com/photo-1621886292650-520f76c747d6",
        caption: "Home office space",
    },
    {
        url: "https://images.unsplash.com/photo-1603512500383-f1f87c13ffc4",
        caption: "Fitness area",
    },
    {
        url: "https://images.unsplash.com/photo-1593604572577-1c6c44fa2f9f",
        caption: "Entertainment room",
    },
    {
        url: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc",
        caption: "Reading nook",
    },
    {
        url: "https://images.unsplash.com/photo-1595514535415-dae8970c381a",
        caption: "Yoga/meditation space",
    },

    // Famous Indian location views
    {
        url: "https://images.unsplash.com/photo-1548013146-72479768bada",
        caption: "Taj Mahal view from property",
    },
    {
        url: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
        caption: "Gateway of India nearby",
    },
    {
        url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66",
        caption: "Jaipur Pink City view",
    },
    {
        url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
        caption: "Golden Temple nearby",
    },
    {
        url: "https://images.unsplash.com/photo-1566552881560-0be862a7c445",
        caption: "Varanasi Ghats view",
    },
    {
        url: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073",
        caption: "Stunning Kerala backwaters",
    },
    {
        url: "https://images.unsplash.com/photo-1477587458883-47145ed94245",
        caption: "Goa beach view",
    },
    {
        url: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd",
        caption: "Udaipur Lake Palace view",
    },
    {
        url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
        caption: "Darjeeling tea gardens",
    },
    {
        url: "https://images.unsplash.com/photo-1597074866923-dc0589150358",
        caption: "Himalayas mountain view",
    },

    // Famous international location views
    {
        url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
        caption: "Eiffel Tower view from window",
    },
    {
        url: "https://images.unsplash.com/photo-1601928782843-0d3a9c7bec5f",
        caption: "Colosseum nearby",
    },
    {
        url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216",
        caption: "Santorini sunset view",
    },
    {
        url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be",
        caption: "London Eye view",
    },
    {
        url: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25",
        caption: "Sydney Opera House view",
    },
    {
        url: "https://images.unsplash.com/photo-1500759285222-a95626b934cb",
        caption: "Burj Khalifa view",
    },
    {
        url: "https://images.unsplash.com/photo-1565967511849-76a60a516170",
        caption: "Central Park view",
    },
    {
        url: "https://images.unsplash.com/photo-1551042863-7bef8d0f1f90",
        caption: "Barcelona Sagrada Familia view",
    },
    {
        url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
        caption: "Tokyo skyline view",
    },
    {
        url: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a",
        caption: "Bali rice terraces nearby",
    },
]

// Combine original and additional data
const allIndianCities = [...indianCities, ...additionalIndianCities]
const allInternationalCities = [
    ...internationalCities,
    ...additionalInternationalCities,
]

// Combine property titles
const allPropertyTitles = {}
Object.keys(propertyTitles).forEach((type) => {
    allPropertyTitles[type] = [
        ...propertyTitles[type],
        ...additionalPropertyTitles[type],
    ]
})

// Combine property descriptions
const allPropertyDescriptions = {}
Object.keys(propertyDescriptions).forEach((type) => {
    allPropertyDescriptions[type] = [
        ...propertyDescriptions[type],
        ...additionalPropertyDescriptions[type],
    ]
})

// Define original street names
const streetNames = [
    "Main Street",
    "Park Avenue",
    "Oak Road",
    "Maple Lane",
    "River View",
    "Mountain Drive",
    "Sunset Boulevard",
    "Lake View",
    "Forest Path",
    "Ocean Drive",
]

// Combine street names
const allStreetNames = [...streetNames, ...additionalStreetNames]

// Generate a single property
const generateProperty = (hostId, isIndian = true) => {
    // Select location based on whether it should be Indian or international
    const location = isIndian
        ? allIndianCities[Math.floor(Math.random() * allIndianCities.length)]
        : allInternationalCities[
              Math.floor(Math.random() * allInternationalCities.length)
          ]

    // Randomly select property type
    const propertyTypes = [
        "apartment",
        "house",
        "condo",
        "villa",
        "cabin",
        "cottage",
        "hotel",
        "other",
    ]
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]

    // Randomly select title and description based on type
    const titleOptions = allPropertyTitles[type]
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)]

    const descriptionOptions = allPropertyDescriptions[type]
    const description =
        descriptionOptions[
            Math.floor(Math.random() * descriptionOptions.length)
        ]

    // Generate random street address
    const streetNumber = getRandomNumber(1, 999)
    const streetName =
        allStreetNames[Math.floor(Math.random() * allStreetNames.length)]

    // Generate random property details
    const bedrooms = getRandomNumber(1, 6)
    const bathrooms = getRandomFloat(1, 4, 1)
    const maxGuests = getRandomNumber(bedrooms, bedrooms * 3)
    const price = getRandomNumber(
        type === "hotel" || type === "apartment" ? 50 : 80,
        type === "villa" || type === "house" ? 500 : 300
    )

    // Select random price period with weighted probability
    const pricePeriodOptions = ["night", "weekly", "monthly"]
    const pricePeriodWeights = [0.7, 0.2, 0.1] // 70% night, 20% weekly, 10% monthly
    const randomValue = Math.random()
    let cumulativeWeight = 0
    let pricePeriod = "night"

    for (let i = 0; i < pricePeriodOptions.length; i++) {
        cumulativeWeight += pricePeriodWeights[i]
        if (randomValue <= cumulativeWeight) {
            pricePeriod = pricePeriodOptions[i]
            break
        }
    }

    // Generate random fees
    const cleaningFee = getRandomBoolean(0.8)
        ? getRandomNumber(15, 100)
        : undefined
    const serviceFee = getRandomBoolean(0.6)
        ? getRandomNumber(10, 50)
        : undefined

    // Select random amenities (between 5 and 15)
    const propertyAmenities = getRandomItems(amenities, getRandomNumber(5, 15))

    // Separate images into categories for better selection
    const generalImages = sampleImageUrls.slice(0, 54) // First 54 images are general property images
    const indianLocationImages = sampleImageUrls.slice(54, 64) // Next 10 are Indian location views
    const internationalLocationImages = sampleImageUrls.slice(64) // Last 10 are international location views

    // Select random general images (between 3 and 6)
    const generalImageCount = getRandomNumber(3, 6)
    const selectedGeneralImages = getRandomItems(
        generalImages,
        generalImageCount
    )

    // Add 1-2 location-specific images based on property location
    const locationImageCount = getRandomNumber(1, 2)
    const locationImages = isIndian
        ? getRandomItems(indianLocationImages, locationImageCount)
        : getRandomItems(internationalLocationImages, locationImageCount)

    // Combine the images
    const images = [...selectedGeneralImages, ...locationImages]

    // Generate random rules
    const checkInTimes = ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    const checkOutTimes = ["10:00 AM", "11:00 AM", "12:00 PM"]
    const quietHours = [
        "9:00 PM - 7:00 AM",
        "10:00 PM - 7:00 AM",
        "10:00 PM - 8:00 AM",
        "11:00 PM - 8:00 AM",
    ]

    // Combine original and additional rules
    const allAdditionalRulesOptions = [
        {
            title: "No shoes inside",
            description: "Please remove shoes when entering the property.",
        },
        {
            title: "No loud music",
            description:
                "Please be mindful of neighbors and avoid playing loud music.",
        },
        {
            title: "No smoking indoors",
            description:
                "Smoking is only permitted in designated outdoor areas.",
        },
        {
            title: "Pool hours",
            description: "Pool is available from 8:00 AM to 10:00 PM.",
        },
        {
            title: "Garbage disposal",
            description:
                "Please separate recyclables and dispose of garbage in designated bins.",
        },
        {
            title: "Parking restrictions",
            description: "Please park only in the assigned parking spot.",
        },
        {
            title: "Check-in procedure",
            description: "Please contact host 30 minutes before arrival.",
        },
        {
            title: "Pet restrictions",
            description:
                "Pets are allowed but must be kept off furniture and beds.",
        },
        ...additionalRules,
    ]

    // Generate more rules (0-4) since we have more options now
    const additionalRulesCount = getRandomNumber(0, 4)
    const propertyAdditionalRules = getRandomItems(
        allAdditionalRulesOptions,
        additionalRulesCount
    )

    // Generate random ratings
    const isRated = getRandomBoolean(0.7) // 70% chance of having ratings
    const avgRating = isRated ? getRandomFloat(3, 5, 1) : 0
    const reviewCount = isRated ? getRandomNumber(1, 50) : 0

    // Generate random availability and approval status
    const isAvailable = getRandomBoolean(0.9) // 90% chance of being available
    const isApproved = getRandomBoolean(0.85) // 85% chance of being approved
    const rejectionReason =
        !isApproved && getRandomBoolean(0.7)
            ? "Property does not meet our quality standards. Please improve the listing with better photos and more detailed description."
            : null

    // Generate random featured status
    const isFeatured = getRandomBoolean(0.15) // 15% chance of being featured
    const featuredUntil = isFeatured
        ? getRandomDate(
              new Date(),
              new Date(new Date().setMonth(new Date().getMonth() + 3))
          )
        : null

    // Create the property object
    return {
        title,
        description,
        type,
        price,
        pricePeriod,
        cleaningFee,
        serviceFee,
        bedrooms,
        bathrooms,
        maxGuests,
        address: {
            street: `${streetNumber} ${streetName}`,
            city: location.city,
            state: location.state,
            zipCode: isIndian
                ? getRandomNumber(100000, 999999).toString()
                : `${getRandomNumber(10000, 99999)}`,
            country: isIndian ? "India" : location.country,
        },
        location: {
            type: "Point",
            coordinates: [
                location.coordinates[0] + (Math.random() - 0.5) * 0.1, // Add some randomness to coordinates
                location.coordinates[1] + (Math.random() - 0.5) * 0.1,
            ],
        },
        amenities: propertyAmenities,
        images,
        host: new mongoose.Types.ObjectId(hostId),
        isAvailable,
        isApproved,
        rejectionReason,
        rules: {
            checkIn:
                checkInTimes[Math.floor(Math.random() * checkInTimes.length)],
            checkOut:
                checkOutTimes[Math.floor(Math.random() * checkOutTimes.length)],
            smoking: getRandomBoolean(0.3), // 30% chance of allowing smoking
            pets: getRandomBoolean(0.4), // 40% chance of allowing pets
            parties: getRandomBoolean(0.2), // 20% chance of allowing parties
            events: getRandomBoolean(0.3), // 30% chance of allowing events
            quietHours:
                quietHours[Math.floor(Math.random() * quietHours.length)],
            additionalRules: propertyAdditionalRules,
        },
        avgRating,
        reviewCount,
        featuredUntil,
    }
}

/**
 * Generate an array of property seed data
 * @param {Array} hostIds - Array of host user IDs
 * @param {Number} count - Number of properties to generate
 * @param {Number} indianPercentage - Percentage of properties that should be in India (0-100)
 * @returns {Array} - Array of property objects
 */
export const generatePropertySeedData = (
    hostIds,
    count = 100,
    indianPercentage = 90
) => {
    const properties = []

    for (let i = 0; i < count; i++) {
        // Determine if this property should be in India based on the percentage
        const isIndian = Math.random() * 100 < indianPercentage

        // Randomly select a host from the provided host IDs
        const hostId = hostIds[Math.floor(Math.random() * hostIds.length)]

        // Generate and add the property
        properties.push(generateProperty(hostId, isIndian))
    }

    return properties
}

// Example usage:
// const hostIds = ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'];
// const propertySeedData = generatePropertySeedData(hostIds, 100, 90);
