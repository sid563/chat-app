# OrgChat - Internal Messaging App

A Slack-like internal chat application built with React + Vite, containerized with Docker for easy deployment.

## Features

- **Channels** — Create and join topic-based channels
- **Direct Messages** — Private 1:1 conversations
- **File Sharing** — Attach and share files
- **User Presence** — Online / Away / Offline status indicators
- **Admin Panel** — Super admin can register/remove users
- **User Switching** — Demo mode to test different roles

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Docker

```bash
# Build
docker build -t org-chat-app .

# Run
docker run -d -p 80:80 --name org-chat org-chat-app
```

Open http://localhost

## EC2 Deployment

See deployment steps in the project wiki or follow the commands provided during setup.

## Tech Stack

- React 18 + Vite 5
- Nginx (production serving)
- Docker (containerized deployment)
# chat-app
