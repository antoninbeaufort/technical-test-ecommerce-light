# Technical test ecommerce light

This repository is a technical challenge for a job interview to create a light ecommerce site between 11/08/2022 and 19/08/2022.

## Requirements

- Node 16
- Docker

## Getting started

- Start the Postgres Database in [Docker](https://www.docker.com/get-started):

  ```sh
  npm run docker
  ```

  > **Note:** The npm script will complete while Docker sets up the container in the background. Ensure that Docker has finished and your container is running before proceeding.

- Initial setup:

  ```sh
  npm run setup
  ```

- Run the first build:

  ```sh
  npm run build
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

- Unit tests:
  ```sh
  npm run test
  ```
- e2e tests:
  ```sh
  npm run test:e2e:run
  ```

## Technical choices explanation

**Remix**:

- Maintability, monorepo for both frontend and backend
- Type safety across frontend and backend
- SSR with hydration, good for SEO and dynamism/UX
- Auto cancel successives fast requests to get the latest state and not block server
