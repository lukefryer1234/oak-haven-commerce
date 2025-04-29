import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface AddressAttributes {
  id: string;
  userId: string;
  type: 'billing' | 'shipping';
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressCreationAttributes extends Omit<AddressAttributes, 'id'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: string;
  public userId!: string;
  public type!: 'billing' | 'shipping';
  public line1!: string;
  public line2!: string;
  public city!: string;
  public county!: string;
  public postcode!: string;
  public isDefault!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
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
    type: {
      type: DataTypes.ENUM('billing', 'shipping'),
      allowNull: false,
    },
    line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    county: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // UK postcode validation regex
        is: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      },
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Address',
    hooks: {
      beforeCreate: async (address: Address) => {
        // If this is set as default, unset any other default addresses of the same type
        if (address.isDefault) {
          await Address.update(
            { isDefault: false },
            {
              where: {
                userId: address.userId,
                type: address.type,
                isDefault: true,
              },
            }
          );
        }
      },
      beforeUpdate: async (address: Address) => {
        if (address.changed('isDefault') && address.isDefault) {
          await Address.update(
            { isDefault: false },
            {
              where: {
                userId: address.userId,
                type: address.type,
                isDefault: true,
                id: { [Op.ne]: address.id },
              },
            }
          );
        }
      },
    },
  }
);

// Set up associations
User.hasMany(Address, {
  foreignKey: 'userId',
  as: 'addresses',
});

Address.belongsTo(User, {
  foreignKey: 'userId',
});

export default Address;
