# Web Serial Project

This project is a web application that allows communication with serial devices using the Web Serial API. It provides a simple user interface to send commands and receive messages from a connected device.

## Project Structure

- `src/`: Contains all the source files of the application.
  - `css/`: Folder containing CSS files.
    - `styles.css`: Styles for the application.
  - `js/`: Folder containing JavaScript files.
    - `SerialScaleController.js`: Manages communication with serial devices.
    - `main.js`: JavaScript entry point for the application.
  - `index.html`: Main HTML page of the application.

- `package.json`: Configuration file for npm, listing dependencies and scripts.
- `Dockerfile`: Configuration file to build a Docker image for the application.
- `docker-compose.yml`: Configuration file to orchestrate deployment with Docker Compose.

## Installation and Usage

### Run

1. Clone the repository:

   ```bash
   git clone https://github.com/SylvainMontagny/stm32wl-serial-webApp.git
   cd stm32wl-serial-webApp
   ```

2. Start the application using Docker Compose (no need to run `npm install` manually):

   ```bash
   docker compose up -d --build
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:4150
   ```

4. To stop the application, use the following command:

   ```bash
   docker compose down
   ```

### Run Without Docker

If you prefer to run the application without Docker, you can:

1. Install dependencies manually:

   ```bash
   npm install
   ```

2. Open the `index.html` file directly in a browser that supports the Web Serial API.

## Contributing

Contributions are welcome! Please submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
