# CC Guru Admin Panel

A modern admin panel for managing credit card data, built with Next.js, Supabase, and shadcn/ui.

## Features

- Modern UI with shadcn/ui components
- Type-safe database operations with Supabase
- Form validation with Zod
- Toast notifications
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/types` - TypeScript type definitions

## Database Schema

The project uses the following Supabase tables:

### banks

- `id` (int, primary key)
- `bank_name` (text, required)
- `logo_url` (text, nullable)
- `created_at` (timestamp with time zone)

## Development

- Use `npm run dev` for development
- Use `npm run build` for production build
- Use `npm run start` to start the production server
- Use `npm run lint` to run ESLint
