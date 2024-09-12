const { Sequelize } = require('sequelize')

async function up({ context: queryInterface }) {
  await queryInterface.createTable('files', {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    file_name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    path: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ext: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    created_at: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    count: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  })
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('files')
}

module.exports = { up, down }
