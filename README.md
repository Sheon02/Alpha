# E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js, React, Node.js, and MongoDB.

## Features

- **Product Catalog**: Browse products with categories, filters, and search
- **User Authentication**: Secure signup/login with NextAuth
- **Shopping Cart**: Add/remove items, adjust quantities
- **Checkout Process**: Secure payment integration
- **Order Management**: View order history and status
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Works on all device sizes

## Technologies Used

### Frontend
- **Next.js** - React framework for server-side rendering
- **React** - JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **NextAuth** - Authentication library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Payment Integration
- **Stripe API** - Payment processing
- **PayPal API** - Alternative payment option

### Deployment
- **Vercel** - Frontend hosting
- **Heroku** - Backend hosting
- **MongoDB Atlas** - Cloud database service

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB account (for database)
- Stripe/PayPal developer accounts (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/e-commerce-project.git
   cd e-commerce-project
2. Install dependencies for both frontend and backend:
   cd frontend
  npm install
  cd ../backend
  npm install
3. Set up environment variables:
  Create a .env file in both frontend and backend directories with the required variables (see .env.example for reference).
4. Start the development servers:
   # In frontend directory
  npm run dev

  # In backend directory (separate terminal)
  npm start
5. Open your browser and navigate to:
  http://localhost:3000
## Project Structure

  e-commerce-project/
  ├── frontend/               # Next.js frontend application
  │   ├── components/         # Reusable UI components
  │   ├── pages/              # Application pages
  │   ├── public/             # Static assets
  │   ├── styles/             # Global styles
  │   ├── store/              # Redux store configuration
  │   └── utils/              # Utility functions
  │
  ├── backend/                # Node.js backend application
  │   ├── config/             # Configuration files
  │   ├── controllers/        # Route controllers
  │   ├── models/             # MongoDB models
  │   ├── routes/             # API routes
  │   ├── middleware/         # Custom middleware
  │   └── utils/              # Utility functions
  │
  ├── .gitignore
  ├── LICENSE
  └── README.md
  
## Available Scripts
###Frontend
  npm run dev - Start development server

  npm run build - Create production build

  npm start - Start production server

  npm test - Run tests

### Backend
  npm start - Start production server

  npm run dev - Start development server with nodemon

  npm test - Run tests

## Deployment
### Frontend (Vercel)
  Push your code to a GitHub repository

  Create a Vercel account and import your project

  Configure environment variables in Vercel dashboard

  Deploy!

### Backend (Heroku)
  Create a Heroku account and new app
  
  Connect your GitHub repository

  Configure environment variables in Heroku settings

  Deploy!

## API Endpoints
  Endpoint	Method	Description
  /api/products	GET	Get all products
  /api/products/:id	GET	Get single product
  /api/products	POST	Create product (admin)
  /api/users/login	POST	User login
  /api/users/register	POST	User registration
  /api/orders	POST	Create new order
  /api/orders/:id	GET	Get order by ID
