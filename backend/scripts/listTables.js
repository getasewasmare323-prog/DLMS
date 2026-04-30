const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;
(async () => {
  const seq = new Sequelize(config);
  try {
    // list all tables
    const [results] = await seq.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public';",
    );
    console.log("all tables", results);
    // search for case-insensitive exercises table
    const [filtered] = await seq.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%exercise%';",
    );
    console.log("filtered", filtered);
  } catch (err) {
    console.error(err);
  } finally {
    await seq.close();
  }
})();
