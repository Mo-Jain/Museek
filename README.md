<h1 align='center'>Museek</h1>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [With Docker](#with-docker)
  - [Without Docker](#without-docker)
- [Usage](#usage)
- [Contributing](#contributing)
- [Contributors](#contributors)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mo-Jain/Museek.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Museek
   ```

3. Now Install the dependencies:
   ```bash
   cd next-app
   pnpm install
   cd ..
   cd ws 
   pnpm install
   ```
4. Create a `.env` file based on the `.env.example` file and configure everything in both the `next-app` and `ws` folders.

5. For postgres, you need to run the following command:
   ```bash
   docker run -d \
   --name Museek-db \
   -e POSTGRES_USER=postgres \
   -e POSTGRES_PASSWORD=postgres \
   -e POSTGRES_DB=mydb \
   -p 5432:5432 \
   postgres
   ```

6. For redis, you need to run the following command:
   ```bash
   docker run -d \
   --name Museek-redis \
   -e REDIS_USERNAME=admin \
   -e REDIS_PASSWORD=root \
   -e REDIS_PORT=6379 \
   -e REDIS_HOST="127.0.0.1" \
   -e REDIS_BROWSER_STACK_PORT=8001 \
   redis/redis-stack:latest 
   ```

7. Now do the following:
   ```bash
   cd next-app
   pnpm postinstall
   cd ..
   cd ws 
   pnpm postinstall
   ```

8. Run the following command to start the application:
   ```bash
    cd next-app
    pnpm dev
    cd ..
    cd ws
    pnpm dev
   ```

9. To access the prisma studio, run the following command:
   ```bash
   cd next-app
   pnpm run prisma:studio
   ```


