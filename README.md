# ZenPrep Admin Dashboard

This is the administration panel for ZenPrep, built with React, Vite, and Supabase.

## Features
- **Dashboard**: Overview of content statistics.
- **Content Manager**: Manage the hierarchy (Exams > Subjects > Chapters > Topics).
- **Question Bank**: Comprehensive question editor with Base64 image support for questions, options, and solutions.
- **GitHub Pages Ready**: Configured for static hosting.

## Setup
1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the local development server.
3. Run `npm run build` to generate the production build in the `dist` folder.

## Deployment to GitHub Pages
1. Build the project: `npm run build`
2. Push the `dist` folder to your `gh-pages` branch or configure GitHub Actions.
3. In your GitHub Repository settings, enable GitHub Pages and set the source to the appropriate branch/folder.

## Supabase Requirements
Ensure you have run the `admin_setup.sql` script in your Supabase SQL editor to add the necessary columns for images and solutions.
