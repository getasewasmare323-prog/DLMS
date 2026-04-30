"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // if Books table exists, copy rows then drop it
    const [exists] = await queryInterface.sequelize.query(
      `SELECT to_regclass('"Books"') as reg;`,
    );
    if (exists[0].reg) {
      await queryInterface.sequelize.query(
        `INSERT INTO "Resources" ("resourceId","title","subject","gradeLevel","filePath","contentType","contentData","resourceType","userId","createdAt","updatedAt")
         SELECT "bookId","title","author",NULL,"file_url",'single',
                json_build_object('published_year',published_year,'category_id',category_id),
                'reading',NULL,"createdAt","updatedAt" FROM "Books";`,
      );
      await queryInterface.dropTable("Books");
    }
  },

  async down(queryInterface, Sequelize) {
    // recreate Books table (empty schema)
    await queryInterface.createTable("Books", {
      bookId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING },
      author: { type: Sequelize.STRING },
      published_year: { type: Sequelize.INTEGER },
      category_id: { type: Sequelize.INTEGER },
      file_url: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.sequelize.query(
      `INSERT INTO "Books" ("bookId","title","author","published_year","category_id","file_url","createdAt","updatedAt")
       SELECT "resourceId","title","subject",
              (contentData->>'published_year')::int,
              (contentData->>'category_id')::int,
              "filePath","createdAt","updatedAt"
       FROM "Resources" WHERE "resourceType"='reading';`,
    );
  },
};
