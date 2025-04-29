import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SettingsAttributes {
  id: string;
  category: 'company' | 'financial' | 'delivery' | 'website';
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SettingsCreationAttributes extends Omit<SettingsAttributes, 'id'> {}

class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
  public id!: string;
  public category!: 'company' | 'financial' | 'delivery' | 'website';
  public key!: string;
  public value!: string;
  public type!: 'string' | 'number' | 'boolean';
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to get typed value
  public getValue(): string | number | boolean {
    switch (this.type) {
      case 'number':
        return parseFloat(this.value);
      case 'boolean':
        return this.value === 'true';
      default:
        return this.value;
    }
  }
}

Settings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: {
      type: DataTypes.ENUM('company', 'financial', 'delivery', 'website'),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isValidValue(value: string) {
          switch (this.type) {
            case 'number':
              if (isNaN(parseFloat(value))) {
                throw new Error('Value must be a valid number');
              }
              break;
            case 'boolean':
              if (!['true', 'false'].includes(value)) {
                throw new Error('Value must be true or false');
              }
              break;
          }
        },
      },
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Settings',
    indexes: [
      {
        unique: true,
        fields: ['key'],
      },
      {
        fields: ['category'],
      },
    ],
  }
);

export default Settings;
