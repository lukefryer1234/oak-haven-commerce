import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface ConfigOption {
  name: string;
  type: 'select' | 'number' | 'boolean';
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
}

interface ProductCategoryAttributes {
  id: string;
  name: 'Garages' | 'Gazebos' | 'Porches' | 'Oak Beams' | 'Oak Flooring';
  description: string;
  configurationOptions: ConfigOption[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCategoryCreationAttributes extends Omit<ProductCategoryAttributes, 'id'> {}

class ProductCategory extends Model<ProductCategoryAttributes, ProductCategoryCreationAttributes> implements ProductCategoryAttributes {
  public id!: string;
  public name!: 'Garages' | 'Gazebos' | 'Porches' | 'Oak Beams' | 'Oak Flooring';
  public description!: string;
  public configurationOptions!: ConfigOption[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM('Garages', 'Gazebos', 'Porches', 'Oak Beams', 'Oak Flooring'),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    configurationOptions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidConfig(value: ConfigOption[]) {
          if (!Array.isArray(value)) {
            throw new Error('Configuration options must be an array');
          }
          
          value.forEach(option => {
            if (!option.name || !option.type || typeof option.required !== 'boolean') {
              throw new Error('Invalid configuration option format');
            }
            
            if (option.type === 'select' && (!option.options || !Array.isArray(option.options))) {
              throw new Error('Select type must have options array');
            }
            
            if (option.type === 'number' && (typeof option.min !== 'number' || typeof option.max !== 'number')) {
              throw new Error('Number type must have min and max values');
            }
          });
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductCategory',
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
  }
);

export default ProductCategory;
