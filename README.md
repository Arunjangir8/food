# Food Delivery App

A full-stack food delivery application built with React, Node.js, Express, and PostgreSQL.

## Features

- **User Authentication**: Customer and Restaurant Owner registration/login
- **Restaurant Management**: Restaurant owners can manage their profiles and menus
- **Menu Browsing**: Customers can browse restaurants and menus
- **Order Management**: Place orders with customizations and track status
- **Profile Management**: User profiles with address management
- **Favorites**: Save favorite restaurants and menu items
- **Cart System**: Add items to cart with customizations

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- Cloudinary for image uploads
- bcryptjs for password hashing

### Frontend
- React 19 with Vite
- React Router for navigation
- Axios for API calls
- Tailwind CSS & Styled Components
- Ant Design components

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/food_delivery_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRE="7d"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT=5000
NODE_ENV="development"
```

5. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:push
```

6. Seed the database with sample data:
```bash
npm run db:seed
```

7. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd FrontEnd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/restaurant/register` - Restaurant owner registration
- `POST /api/auth/restaurant/login` - Restaurant owner login

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant (owner only)

### Menu
- `GET /api/menu/restaurant/:restaurantId` - Get restaurant menu
- `POST /api/menu/items` - Create menu item (owner only)
- `PUT /api/menu/items/:id` - Update menu item (owner only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (owner only)

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

## Sample Login Credentials

After running the seed script, you can use these credentials:

**Customer Account:**
- Email: customer@example.com
- Password: password123

**Restaurant Owner Account:**
- Email: owner@pizzapalace.com
- Password: password123

## Project Structure

```
someThingNew/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
└── FrontEnd/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── style/
    └── package.json
```

## Development

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.