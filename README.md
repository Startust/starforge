# Starforge

## Overview

Starforge is a modular backend service built with [NestJS](https://nestjs.com/) and [TypeScript](https://www.typescriptlang.org/).  It provides a foundation for web applications that need cloud uploads, email notifications, task scheduling, and integration with external APIs.  The project is configured with a sensible default architecture and Swagger API documentation for easy exploration.

## Features

- **Modular design** – separates functionality into clean modules including upload, notifications, queues, tasks, webhooks and integrations.
- **Cloud file uploads** – generates pre‑signed URLs and stores files in AWS S3 buckets using the AWS SDK.
- **Email notifications** – sends HTML emails through Gmail’s API and can render MJML templates for dynamic content.
- **Google integrations** – uses the Google APIs client to authenticate with OAuth2 and interact with Gmail and Google Sheets.
- **Queue processing** – utilises BullMQ for job queues, with Bull Board providing a web UI (`/admin/queues`) to monitor queued tasks.
- **Task scheduling** – exposes an admin endpoint to list and trigger cron jobs (`/admin/tasks`).
- **Database ORM** – integrates [Prisma](https://www.prisma.io/) for database access and migrations.
- **Rate limiting** – protects endpoints with NestJS’s throttling guard.
- **Swagger documentation** – automatically generates OpenAPI docs available at `/docs` to explore and test the API.

## Getting Started

Follow these steps to set up a local development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm or yarn
- [Redis](https://redis.io/) for BullMQ queues
- A relational database supported by Prisma (e.g. PostgreSQL)

You will also need AWS and Google service credentials to enable uploads and email features.

### Installation

1. Clone this repository and install dependencies:

   ```sh
   git clone https://github.com/Startust/starforge.git
   cd starforge
   npm install
   # or
   yarn
   ```

2. Generate the Prisma client and run database migrations:

   ```sh
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Environment Configuration

Environment variables are loaded via `.env` files based on your `NODE_ENV` value.  Copy `.env.example` (or create your own) to configure the following variables:

| Variable                  | Purpose                                        |
|--------------------------|------------------------------------------------|
| `DATABASE_URL`           | Database connection string for Prisma         |
| `PORT`                   | Port for the HTTP server (default `4000`)      |
| `REDIS_URL`              | Redis connection string for BullMQ queues      |
| `AWS_REGION`             | AWS region for S3                              |
| `AWS_ACCESS_KEY_ID`      | AWS access key                                 |
| `AWS_SECRET_ACCESS_KEY`  | AWS secret key                                 |
| `S3_BUCKET_NAME`         | Name of the S3 bucket for uploads              |
| `UPLOAD_ROOT_PREFIX`     | Folder prefix for uploaded files (optional)    |
| `GOOGLE_CLIENT_ID`       | OAuth client ID for Google APIs                |
| `GOOGLE_CLIENT_SECRET`   | OAuth client secret for Google APIs            |
| `GOOGLE_REFRESH_TOKEN`   | OAuth refresh token for server‑to‑server calls |
| `GOOGLE_REDIRECT_URI`    | OAuth redirect URI (used for obtaining tokens) |
| `GMAIL_FROM_EMAIL`       | Default sender email address                   |

### Running the Server

Start the development server with hot‑reloading:

```sh
npm run start:dev
# or
yarn start:dev
```

The application will listen on `http://localhost:<PORT>` (default 4000).  Swagger documentation is available at `http://localhost:<PORT>/docs`.

### Running Tests

Unit tests use Jest and ts‑jest:

```sh
npm run test
```

Use `npm run test:watch` to re‑run tests on file changes and `npm run test:cov` to generate coverage reports.

## Modules

The codebase is organised into several modules:

- **AppModule** – bootstraps the NestJS application and configures global middleware, interceptors and filters.
- **UploadModule** – exposes `/upload/presign` and `/upload/meta` endpoints and uses the AWS SDK to generate pre‑signed S3 URLs and fetch object metadata.
- **NotificationModule** – wraps the Gmail API and MJML template rendering to send email notifications.
- **GoogleModule** – provides OAuth2 authentication and wrappers for Gmail and Google Sheets APIs.
- **QueueModule** – configures BullMQ queues and the Bull Board dashboard at `/admin/queues` and defines the `email-queue` processor.
- **TaskModule** – lists registered cron tasks and allows them to be triggered manually via `/admin/tasks`.
- **WebhookModule** – placeholder for handling incoming webhooks.
- **PrismaModule** – sets up the Prisma client for database access.

## API Documentation

The project uses `@nestjs/swagger` to generate an OpenAPI spec.  Once the server is running, visit:

```
http://localhost:<PORT>/docs
```

to explore available endpoints, models and response structures.

## Contributing

Contributions are welcome!  If you find an issue or have ideas for improvements, please open an issue or submit a pull request.  This project uses [eslint](https://eslint.org/), [Prettier](https://prettier.io/) and [husky](https://typicode.github.io/husky/#/) to enforce consistent code style.  Run `npm run lint` to check your changes before committing.

## License

This project is currently **UNLICENSED**.  If you wish to use the code outside your own study or evaluation, please contact the repository owner.
