const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;

async function main() {
  const seq = new Sequelize(config);
  try {
    await seq.query(
      `DELETE FROM "SequelizeMeta" WHERE name = '20260226121743-add-exercise-fk-to-questions.js'`,
    );
    console.log("Removed 20260226121743-add-exercise-fk-to-questions.js");

    await seq.query(
      `DELETE FROM "SequelizeMeta" WHERE name = '20260219090206-add-role-to-user.js'`,
    );
    console.log("Removed 20260219090206-add-role-to-user.js");

    await seq.query(
      `DELETE FROM "SequelizeMeta" WHERE name = '20260219083754-add-role-to-user.js'`,
    );
    console.log("Removed 20260219083754-add-role-to-user.js");
  } catch (err) {
    console.error("Error removing entry", err);
  } finally {
    await seq.close();
  }
}

main();
