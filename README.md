# TailAdmin Next.js - Free Next.js Tailwind Admin Dashboard Template

TailAdmin is a free and open-source admin dashboard template built on **Next.js and Tailwind CSS** providing developers with everything they need to create a feature-rich and data-driven: back-end, dashboard, or admin panel solution for any sort of web project.

![TailAdmin - Next.js Dashboard Preview](./banner.png)

TailAdmin utilizes the powerful features of **Next.js 15** and common features of Next.js such as server-side rendering (SSR), static site generation (SSG), and seamless API route integration. Combined with the advancements of **React 19** and the robustness of **TypeScript**, TailAdmin is the perfect solution to help get your project up and running quickly.

## Overview

TailAdmin provides essential UI components and layouts for building feature-rich, data-driven admin dashboards and control panels. It's built on:

- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS V4

### Quick Links
- [✨ Visit Website](https://tailadmin.com)
- [📄 Documentation](https://tailadmin.com/docs)
- [⬇️ Download](https://tailadmin.com/download)
- [🖌️ Figma Design File (Community Edition)](https://www.figma.com/community/file/1463141366275764364)
- [⚡ Get PRO Version](https://tailadmin.com/pricing)

### Demos
- [Free Version](https://nextjs-free-demo.tailadmin.com)
- [Pro Version](https://nextjs-demo.tailadmin.com)

### Other Versions
- [HTML Version](https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template)
- [React Version](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)
- [Vue.js Version](https://github.com/TailAdmin/vue-tailwind-admin-dashboard)

## Installation

### Prerequisites
To get started with TailAdmin, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)

### Cloning the Repository
Clone the repository using the following command:

```bash
git clone https://github.com/TailAdmin/free-nextjs-admin-dashboard.git
```

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

1. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
    > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

## Components

TailAdmin is a pre-designed starting point for building a web-based dashboard using Next.js and Tailwind CSS. The template includes:

- Sophisticated and accessible sidebar
- Data visualization components
- Profile management and custom 404 page
- Tables and Charts(Line and Bar)
- Authentication forms and input elements
- Alerts, Dropdowns, Modals, Buttons and more
- Can't forget Dark Mode 🕶️

All components are built with React and styled using Tailwind CSS for easy customization.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.


# d1-starter-sessions-api

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template)

<!-- dash-content-start -->

Starter repository using Cloudflare Workers with D1 database and the new [D1 Sessions API for read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/#use-sessions-api).

## What is the demo?

This demo simulates purchase orders administration.
There are two main actions you can do.

1. Create an order with a `customerId`, `orderId`, and `quantity`.
2. List all orders.

The UI when visiting the deployed Worker project shows 3 buttons.

- **Create order & List**
  - Creates a new order using the provided customer ID with a random order ID and quantity.
  - Does a `POST /api/orders` request to the Worker, and its handler uses the Sessions API to do an `INSERT` first for the new order that will be forwarded to the primary database instance, followed by a `SELECT` query to list all orders that will be executed by nearest replica database.
- **List orders**
  - Lists every order recorded in the database.
  - Does a `GET /api/orders` request to the Worker, and its handler uses the Sessions API to do a `SELECT` query to list the orders that will be executed by the nearest replica database.
- **Reset**
  - Drops and recreates the orders table.
  - Gets executed by the primary database.

The UI JavaScript code maintains the latest `bookmark` returned by the API and sends it along every subsequent request.
This ensures that we have sequential consistency in our observed database results and all our actions are properly ordered.

Read more information about how the Sessions API works, and how sequential consistency is achieved in the [D1 read replication documentation](https://developers.cloudflare.com/d1/best-practices/read-replication/).

<!-- dash-content-end -->

## Deploy

1. Checkout the project locally.
2. Run `npm ci` to install all dependencies.
3. Run `npm run deploy` to deploy to your Cloudflare account.
4. Visit the URL you got in step 3.

## Local development

1. Run `npm run dev` to start the development server.
2. Visit <http://localhost:8787>.

Note: The "Served by Region" information won't be shown when running locally.
