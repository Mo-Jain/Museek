<h1 align='center'>Museek</h1>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)

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
   ```
4. Create a `.env` file based on the `.env.example` file and configure everything in both the `app` folder

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

7. Now do the following:
   ```bash
   cd next-app
   pnpm postinstall
   ```

8. Run the following command to start the application:
   ```bash
    cd next-app
    pnpm dev
   ```

9. To access the prisma studio, run the following command:
   ```bash
   cd next-app
   pnpm run prisma:studio
   ```


## Usage 

1. Access the application in your browser at http://localhost:3000
3. Access the prisma studio at http://localhost:5555