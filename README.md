# TRMNL BYOS - Build Your Own Server

A self-hosted server for managing TRMNL e-ink display devices. Take complete control of your devices with zero external dependencies.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app)

## Features

- **Device Management** - Monitor and control all your TRMNL devices from a unified dashboard
- **Dynamic Screens** - Create custom screens with clock, weather, quotes, and more widgets
- **Self-Hosted** - Complete control over your data with zero external dependencies
- **JSON API** - Full API support for device setup, display rendering, and logging
- **Real-time Monitoring** - Track device status, logs, and system health
- **Dark Mode** - Beautiful light and dark themes

## Quick Start

1. **Configure Your Device** - Point your TRMNL device to this server's API endpoint
2. **Create Screens** - Design custom screens in the dashboard with various templates
3. **Monitor & Manage** - View device status, logs, and update screens in real-time

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Environment Variables

Required environment variables are automatically configured when using Supabase integration:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- `DASHBOARD_PASSWORD` - Password for dashboard access

## API Endpoints

- `POST /api/setup` - Register a new device
- `GET /api/display` - Get display content for device
- `POST /api/log` - Log device events
- `GET /api/diagnostics` - System health and diagnostics
- `GET /api/health` - API health check

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## License

MIT
