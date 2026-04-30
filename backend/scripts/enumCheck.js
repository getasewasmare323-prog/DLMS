const { Sequelize } = require("sequelize");
const config = require("../config/config.json").development;
(async () => {
  const seq = new Sequelize(config);
  try {
    const [r] = await seq.query(
      "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname LIKE '%resourceType%' OR t.typname LIKE '%contentType%';",
    );
    console.log(r);
  } catch (err) {
    console.error(err);
  } finally {
    await seq.close();
  }
})();
