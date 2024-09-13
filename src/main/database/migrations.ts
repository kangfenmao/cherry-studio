import { DataTypes } from 'sequelize'

export default [
  {
    name: '20240912072241-create-files-table',
    async up({ context }) {
      await context.createTable('files', {
        id: {
          type: DataTypes.TEXT,
          primaryKey: true
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        file_name: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        path: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        ext: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        type: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        created_at: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        count: {
          type: DataTypes.INTEGER,
          defaultValue: 1
        }
      })
    },
    async down({ context }) {
      await context.dropTable('files')
    }
  }
]
