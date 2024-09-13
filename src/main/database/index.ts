import Logger from 'electron-log'
import path from 'path'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'

import { DATA_PATH } from '../config'
import migrations from './migrations'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(DATA_PATH, 'data.db'),
  logging: false
})

const umzug = new Umzug({
  migrations,
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'Migration', tableName: 'migrations' }),
  logger: Logger
})

export async function initDatabase() {
  try {
    await sequelize.authenticate()
    Logger.log('Database connection has been established successfully.')

    // Run migrations
    await umzug.up()
    Logger.log('Migrations have been executed successfully.')
  } catch (error) {
    Logger.error('Migrations failed to execute:', error)
  }
}

export default sequelize
