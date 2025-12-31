# Harken

This project is a ' Description of the project '

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [nvm] (https://github.com/nvm-sh/nvm)

Installed pandoc on your machine according to your operating system.

- [pandoc](https://pandoc.org/installing.html)

### Installing

1. Clone the repository:

   ```bash
   https://github.com/HarkenCRE/Harken-v2.git

   ```

2. Run `nvm use 20`, It will automatically use required version of node and npm
3. Run `npm install` to install the required dependencies.
4. Run `export NODE_ENV={env} && npx sequelize-cli db:migrate` to run migrations. {env} values are development, test, and production.
5. Run `export NODE_ENV={env} && npx sequelize-cli db:seed:all` to run seeders. {env} values are development, test, and production.

### Installation of Database/phpMyAdmin

If you are using the docker then follow these steps

1. Navigate to the backend directory `cd packages/backend`
2. In this directory, the `xdocker-compose.yml` file is located.
3. The default credentials are set in this file. If you want to change them, feel free to edit the file as needed.
4. Open your terminal and run the following command to start the Docker containers:

   ```bash
   docker-compose up -d
   ```

5. Once the containers are running, you can access phpMyAdmin at:
   `http://localhost:8080/index.php`

## Code Structure and Standards

Follow the below mentioned code standards to work with the project.

### Frontend Folder Structures

1. `src` folder holds the majority of the project.
2. `api` folder in src has api-client using axios.
3. `components` has majority of reuseable components.
   3a. Also, `components/elements` has baseline components like buttons, form elements, base modals etc.
   3b. `components/icons` has the exported icons from `react-icons` library.

4. `hook` folder consist of custom hooks used in the application.
5. `pages` folder contains the screens and pages of different modules of the application.
6. `provider` folder contains the wrapper of providers from external libraries.
7. `utils` folder has the utility functions and helper methods or constants which are used in the application.
   Example use of `utils`:
   - Magic strings
   - API Endpoints
   - Date helper methods
   - Custom Material themes (if any)

### Frontend Libraries

1. Material UI & Tailwind CSS - For Styling of the application
2. Axios - For api calls and intercepting api requests
3. Formik - Formik is used to build dynamic forms.
4. React-icons - To use icons.
5. React-query - For Data fetching and caching

- ES lint - for Linting errors
- Prettier - for formatting of code
- Husky and lint-staged - for git hooks to avoid errors in commit.
- Typescript - To have a type safe application

### Frontend Code standards

1. Use `index.ts` files in the root folder to export any component, function or constants. Example: In components, we have index.ts to export all the components from `elements` folder and import statements are also simplified
2. Use abstracted library of icons in `components/icons` to import icons from `react-icons`
3. For Naming conventions,
   - 3.1. Use kebab-case for naming of folders. eg. `folder-name`
   - 3.2. Use CamelCasing for naming of hooks. eg. `useMutate`
   - 3.3. Use PascalCase for naming of components and providers. eg. `ComponentName`

### SQL Mode Configuration

To ensure proper data validation and error handling, configure your SQL mode with the following settings:

STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

### Google Maps API Configuration

To ensure the Google Maps Static API works correctly in your environment, follow the steps below:

1. **Enable Maps Static API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/), open your project, and make sure the following API is enabled:
     - **Maps Static API**

2. **Check API Restrictions**

   - Navigate to `API & Services` > `Credentials` > `API Key`.
   - Make sure the key you’re using has access to the **Maps Static API**.
   - If **API restrictions** are enabled, ensure **Maps Static API** is selected.

3. **Check Application Restrictions**

   - If you're using **HTTP referrers (websites)** or **IP addresses**, ensure your server IP is correctly added to the allowed list under **Application restrictions**.

4. **Final Verification**
   - Once these settings are updated, the request should work properly in your environment.

## Google Maps API Key Restrictions

To improve the security of your Google Maps API key and prevent unauthorized usage, the following restrictions have been applied:

### Application Restrictions

- **Type:** `None`
  > _The key is currently unrestricted in terms of application origin. It's recommended to restrict it to your application's domain or IP address in production._

### API Restrictions

- **Restriction Type:** `Restricted key`
  > _This key can only call the selected APIs listed below._

### Enabled APIs (25 Total)

- Maps SDK for Android
- Directions API
- Distance Matrix API
- Maps Elevation API
- Maps Embed API
- Geocoding API
- Geolocation API
- Maps JavaScript API
- Roads API
- Maps SDK for iOS
- Time Zone API
- Places API
- Maps Static API
- Street View Static API
- Map Tiles API
- Routes API
- Address Validation API
- Maps Platform Datasets API
- Air Quality API
- Solar API
- Aerial View API
- Places API (New)
- Street View Publish API
- Pollen API
- Route Optimization API
