const fs = require('fs');
const path = require('path');

const updateViteEnvPlugin = () => {
  return {
    name: 'update-env-plugin', // Name of the plugin
    writeBundle() {
      // Path to the .env file in your Vite project
      const envPath = path.join(__dirname, '../../apps/interactor/.env');

      fs.readFile(envPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading .env file:', err);
          return;
        }

        // Generate a random number
        const randomValue = Math.floor(Math.random() * 10000);

        // Replace or add VITE_RANDOM variable
        const updatedData =
          data.replace(/VITE_RANDOM=\d*/, `VITE_RANDOM=${randomValue}`).trim() +
          '\n';

        // Write the updated data back to the .env file
        fs.writeFile(envPath, updatedData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing .env file:', err);
          }
        });
      });
    },
  };
};
export default updateViteEnvPlugin;
