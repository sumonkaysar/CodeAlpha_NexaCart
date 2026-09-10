const app = require("./app");
const connectDB = require("./app/config/db");

const main = async () => {
  try {
    connectDB();

    app.listen(envVars.PORT, () => {
      console.log(`Server is on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

(async () => {
  await main();
  await seedAdmin();
})();
