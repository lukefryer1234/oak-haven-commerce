import User from './User';
import Address from './Address';
import ProductCategory from './ProductCategory';
import ProductConfig from './ProductConfig';
import Order from './Order';
import Settings from './Settings';

// Note: Most relationships are already defined in individual model files
// This file serves as a central export point and for any additional relationships

export {
  User,
  Address,
  ProductCategory,
  ProductConfig,
  Order,
  Settings,
};

// Export default object for convenience
export default {
  User,
  Address,
  ProductCategory,
  ProductConfig,
  Order,
  Settings,
}; 