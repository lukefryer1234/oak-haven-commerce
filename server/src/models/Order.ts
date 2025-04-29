import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Address from './Address';
import ProductConfig from './ProductConfig';

interface OrderItemAttributes {
  productConfigId: string;
  quantity: number;
  priceAtTime: number;
  options: Record<string, any>;
}

interface OrderAttributes {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItemAttributes[];
  billingAddressId: string;
  shippingAddressId: string;
  subtotal: number;
  shippingCost: number;
  vatAmount: number;
  total: number;
  paymentMethod: 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Omit<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public userId!: string;
  public status!: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  public items!: OrderItemAttributes[];
  public billingAddressId!: string;
  public shippingAddressId!: string;
  public subtotal!: number;
  public shippingCost!: number;
  public vatAmount!: number;
  public total!: number;
  public paymentMethod!: 'stripe' | 'paypal';
  public paymentStatus!: 'pending' | 'paid' | 'failed';
  public paymentIntentId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidItems(value: OrderItemAttributes[]) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Order must have at least one item');
          }
          
          value.forEach(item => {
            if (!item.productConfigId || typeof item.quantity !== 'number' || typeof item.priceAtTime !== 'number') {
              throw new Error('Invalid order item format');
            }
            if (item.quantity < 1) {
              throw new Error('Item quantity must be at least 1');
            }
            if (item.priceAtTime < 0) {
              throw new Error('Item price cannot be negative');
            }
          });
        },
      },
    },
    billingAddressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Address,
        key: 'id',
      },
    },
    shippingAddressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Address,
        key: 'id',
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    vatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe', 'paypal'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['paymentStatus'],
      },
    ],
  }
);

// Set up associations
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});

Order.belongsTo(User, {
  foreignKey: 'userId',
});

Order.belongsTo(Address, {
  foreignKey: 'billingAddressId',
  as: 'billingAddress',
});

Order.belongsTo(Address, {
  foreignKey: 'shippingAddressId',
  as: 'shippingAddress',
});

export default Order;
