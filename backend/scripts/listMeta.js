const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;

async function main() {
  const seq = new Sequelize(config);
  try {
    const [results] = await seq.query('SELECT * FROM "SequelizeMeta"');
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    await seq.close();
  }
}
main();
