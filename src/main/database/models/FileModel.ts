import { DataTypes, Model } from 'sequelize'

import { FileMetadata, FileType } from '../../../renderer/src/types'
import sequelize from '..'

class FileModel extends Model<FileMetadata> implements FileMetadata {
  public id!: string
  public name!: string
  public file_name!: string
  public path!: string
  public size!: number
  public ext!: string
  public type!: FileType
  public created_at!: Date
  public count!: number
}

FileModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: DataTypes.STRING,
    file_name: DataTypes.STRING,
    path: DataTypes.STRING,
    size: DataTypes.INTEGER,
    ext: DataTypes.STRING,
    type: DataTypes.STRING,
    created_at: DataTypes.DATE,
    count: DataTypes.INTEGER
  },
  {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    timestamps: false
  }
)

export default FileModel
