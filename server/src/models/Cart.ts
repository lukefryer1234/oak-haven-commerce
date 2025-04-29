import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User, ProductConfig } from './';

interface CartItemOptions {
  sizeType?: string;
  trussType?: 'Curved' | 'Straight';
  numberOfBays?: number;
  catSlide?: boolean;
  legType?: string;
  oakType: 'Reclaimed' | 'Kilned Dried' | 'Green';
  dimensions?: {
    length: number;
    width: number;
    thickness?: number;
  };
}

interface CartAttributes {
  id: string;
  userId: string;
  items: Array<{
    productConfigId: string;
    quantity: number;
    options: CartItemOptions;
    priceAtTime: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Omit<CartAttributes, 'id'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: string;
  public userId!: string;
  public items!: Array<{
    productConfigId: string;
    quantity: number;
    options: CartItemOptions;
    priceAtTime: number;
  }>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to calculate cart totals
  public async calculateTotals() {
    let subtotal = 0;
    let itemCount = 0;

    for (const item of this.items) {
      subtotal += item.priceAtTime * item.quantity;
      itemCount += item.quantity;
    }

    return {
      subtotal,
      itemCount,
      items: this.items
    };
  }
}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidItems(value: CartAttributes['items']) {
          if (!Array.isArray(value)) {
            throw new Error('Items must be an array');
          }

          value.forEach(item => {
            if (!item.productConfigId || !item.options || typeof item.quantity !== 'number' || typeof item.priceAtTime !== 'number') {
              throw new Error('Invalid cart item format');
            }

            if (item.quantity < 1) {
              throw new Error('Item quantity must be at least 1');
            }

            if (item.priceAtTime < 0) {
              throw new Error('Item price cannot be negative');
            }

            // Validate options based on item type
            if (!item.options.oakType || !['Reclaimed', 'Kilned Dried', 'Green'].includes(item.options.oakType)) {
              throw new Error('Invalid oak type');
            }

            if (item.options.trussType && !['Curved', 'Straight'].includes(item.options.trussType)) {
              throw new Error('Invalid truss type');
            }

            if (item.options.dimensions) {
              const { length, width, thickness } = item.options.dimensions;
              if (typeof length !== 'number' || typeof width !== 'number') {
                throw new Error('Length and width must be numbers');
              }
              if (thickness && typeof thickness !== 'number') {
                throw new Error('Thickness must be a number if provided');
              }
              if (length <= 0 || width <= 0 || (thickness && thickness <= 0)) {
                throw new Error('Dimensions must be positive numbers');
              }
            }
          });
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
    ],
  }
);

// Set up associations
User.hasOne(Cart, {
  foreignKey: 'userId',
  as: 'cart',
});

Cart.belongsTo(User, {
  foreignKey: 'userId',
});

export default Cart; 