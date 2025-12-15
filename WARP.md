# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Current status (as of 2025-12-15)
This repository is a Java + Maven project scaffold for “slack-buffer” (a Slack scheduling tool for curating and posting).

## Common commands
Build:
- `mvn -q test` (compile + run unit tests)
- `mvn -q package` (build jar into `target/`)

Run locally:
- `mvn -q spring-boot:run` (starts on port 3000)

Endpoints:
- Slack events endpoint: `/slack/events`
- Web UI (React skeleton): `/` (also available at `/app`)

Run tests:
- `mvn -q test`
- `mvn -q -Dtest=SlackBufferApplicationTest test` (single test class)
- `mvn -q -Dtest=SlackBufferApplicationTest#contextLoads test` (single test method)

Clean:
- `mvn -q clean`

## Architecture / structure
- Spring Boot web app (embedded servlet container) using Slack Bolt for Java.
- Slack request handling is implemented as a servlet at `/slack/events` in `dev.slackbuffer.slack.SlackAppController`.
- Slack “hello world” command handler is registered for `/hello` in the Bolt `App` bean defined by `dev.slackbuffer.slack.SlackApp`.
- Web UI is served separately from Slack endpoints:
  - Server-side route/controller: `dev.slackbuffer.web.WebAppController` (forwards `/` and `/app` to the static entrypoint)
  - Static assets: `src/main/resources/static/app/` (includes `index.html`, `app.js`, `styles.css`)
- Entry point: `dev.slackbuffer.SlackBufferApplication`.
