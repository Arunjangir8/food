# 🍕 Food Delivery App

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express" alt="Express">
</div>

<p align="center">
  A modern, full-stack food delivery application built with React, Node.js, Express, and PostgreSQL.
</p>

---

## ✨ Features

### 👥 User Management
- **Dual Authentication System**: Separate login for customers and restaurant owners
- **Email Verification**: OTP-based email verification for secure registration
- **Secure Registration**: JWT-based authentication with password encryption
- **Profile Management**: Complete user profile with address management
- **Password Security**: Change password functionality with validation

### 🏪 Restaurant Features
- **Restaurant Dashboard**: Owners can manage restaurant profiles
- **Menu Management**: Add, edit, and delete menu items with images
- **Order Processing**: Real-time order management and status updates
- **Analytics**: Track orders and restaurant performance

### 🛒 Customer Experience
- **Restaurant Discovery**: Browse and search restaurants by cuisine
- **Interactive Menu**: View detailed menu items with images and descriptions
- **Smart Cart System**: Add items with customizations and quantity
- **Order Tracking**: Real-time order status updates
- **Favorites System**: Save favorite restaurants and menu items
- **Multiple Addresses**: Manage delivery addresses

### 🚀 Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Image Management**: Cloudinary integration for optimized images
- **Real-time Updates**: Live order status tracking
- **Error Handling**: Comprehensive error management
- **Data Validation**: Input validation on both frontend and backend

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
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/resend-otp` - Resend email OTP
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

## 🔐 Sample Login Credentials

After running the seed script, you can use these test accounts:

### 👤 Customer Account
```
Email: user@gmail.com
Password: user1234
```

### 🏪 Restaurant Owner Account
```
Email: arun1@gmail.com
Password: arun9988
```

> **Note**: These are demo accounts for testing purposes. In production, use strong, unique passwords.

## 📁 Project Structure

```
someThingNew/
├── 📂 Backend/                 # Node.js/Express API
│   ├── 📂 prisma/
│   │   ├── 📄 schema.prisma    # Database schema
│   │   ├── 📂 migrations/      # Database migrations
│   │   └── 📄 seed.js          # Sample data seeder
│   ├── 📂 src/
│   │   ├── 📂 config/          # Database & app configuration
│   │   ├── 📂 controllers/     # Route handlers
│   │   ├── 📂 middleware/      # Authentication & validation
│   │   ├── 📂 routes/          # API routes
│   │   ├── 📂 scripts/         # Utility scripts
│   │   ├── 📂 utils/           # Helper functions
│   │   └── 📄 server.js        # Express server entry point
│   ├── 📄 package.json
│   └── 📄 .env.example         # Environment variables template
├── 📂 FrontEnd/                # React application
│   ├── 📂 src/
│   │   ├── 📂 components/      # Reusable UI components
│   │   ├── 📂 context/         # React context providers
│   │   ├── 📂 pages/           # Page components
│   │   ├── 📂 services/        # API service functions
│   │   ├── 📂 style/           # CSS and styling
│   │   └── 📄 App.jsx          # Main app component
│   ├── 📄 package.json
│   ├── 📄 vite.config.js       # Vite configuration
│   └── 📄 tailwind.config.js   # Tailwind CSS config
└── 📄 README.md                # Project documentation
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

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Ensure PostgreSQL database is configured
3. Run database migrations: `npm run db:push`
4. Deploy with: `npm start`

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables for API endpoints

## 🐛 Troubleshooting

### Common Issues
- **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
- **CORS Errors**: Check if frontend URL is allowed in backend CORS configuration
- **Image Upload**: Verify Cloudinary credentials are properly set
- **JWT Errors**: Ensure JWT_SECRET is set and consistent

### Debug Commands
```bash
# Check database connection
npm run db:studio

# View logs
npm run dev -- --verbose

# Reset database
npm run db:reset
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for utility-first styling
- Cloudinary for image management

---

<div align="center">
  <p>Made with ❤️ by Arun</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>