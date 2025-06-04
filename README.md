# AeroGIS Client

AeroGIS Client is a desktop application for planning UAV flights and receiving telemetry. It combines React, Mapbox and Electron to provide an interactive map interface where you can create polygons, generate waypoints and communicate with a drone using the MAVLink protocol.

## Prerequisites

- Node.js 18 or later
- npm
- A Mapbox access token for map rendering

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and specify your Mapbox token:

   ```
   VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   ```

## Running in Development

Start the application with hot reload:

```bash
npm run dev
```

This command launches the Vite development server and automatically starts Electron.

## Building for Production

To produce a distributable package run:

```bash
npm run build
```

You can also run the compiled version locally with:

```bash
npm start
```
