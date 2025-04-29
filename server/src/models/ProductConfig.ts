import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import ProductCategory from './ProductCategory';

interface Dimensions {
  length: number;
  width: number;
  thickness: number;
}

interface ProductConfigAttributes {
  id: string;
  categoryId: string;
  options: {
    sizeType?: string;
    trussType?: 'Curved' | 'Straight';
    numberOfBays?: number;
    catSlide?: boolean;
    legType?: string;
    oakType: 'Reclaimed' | 'Kilned Dried' | 'Green';
    dimensions?: Dimensions;
  };
  basePrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductConfigCreationAttributes extends Omit<ProductConfigAttributes, 'id'> {}

class ProductConfig extends Model<ProductConfigAttributes, ProductConfigCreationAttributes> implements ProductConfigAttributes {
  public id!: string;
  public categoryId!: string;
  public options!: {
    sizeType?: string;
    trussType?: 'Curved' | 'Straight';
    numberOfBays?: number;
    catSlide?: boolean;
    legType?: string;
    oakType: 'Reclaimed' | 'Kilned Dried' | 'Green';
    dimensions?: Dimensions;
  };
  public basePrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ProductCategory,
        key: 'id',
      },
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidOptions(value: ProductConfigAttributes['options']) {
          if (!value || typeof value !== 'object') {
            throw new Error('Options must be an object');
          }

          if (!value.oakType || !['Reclaimed', 'Kilned Dried', 'Green'].includes(value.oakType)) {
            throw new Error('Invalid oak type');
          }

          if (value.trussType && !['Curved', 'Straight'].includes(value.trussType)) {
            throw new Error('Invalid truss type');
          }

          if (value.numberOfBays && (value.numberOfBays < 1 || value.numberOfBays > 4)) {
            throw new Error('Number of bays must be between 1 and 4');
          }

          if (value.dimensions) {
            const { length, width, thickness } = value.dimensions;
            if (typeof length !== 'number' || typeof width !== 'number' || typeof thickness !== 'number') {
              throw new Error('Dimensions must be numbers');
            }
            if (length <= 0 || width <= 0 || thickness <= 0) {
              throw new Error('Dimensions must be positive numbers');
            }
          }
        },
      },
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductConfig',
    indexes: [
      {
        fields: ['categoryId'],
      },
    ],
  }
);

// Set up associations
ProductCategory.hasMany(ProductConfig, {
  foreignKey: 'categoryId',
  as: 'configurations',
});

ProductConfig.belongsTo(ProductCategory, {
  foreignKey: 'categoryId',
});

export default ProductConfig;
