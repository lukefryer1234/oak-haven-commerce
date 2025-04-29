import { Request, Response } from 'express';
import Cart from '../models/Cart';
import ProductConfig from '../models/ProductConfig';
import { calculatePrice } from './product.controller';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

interface AddToCartRequestBody {
  productConfigId: string;
  quantity: number;
  options?: Record<string, any>;
}

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const totals = await cart.calculateTotals();
    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productConfigId, quantity, options } = req.body as AddToCartRequestBody;

    // Validate input
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    // Validate product config exists
    const productConfig = await ProductConfig.findByPk(productConfigId);
    if (!productConfig) {
      return res.status(404).json({ message: 'Product configuration not found' });
    }

    // Calculate price for the item
    const priceResult = await calculatePrice(
      {
        body: {
          categoryId: productConfig.categoryId,
          options
        }
      } as Request,
      res
    );

    if (!priceResult || typeof priceResult !== 'object' || !('finalPrice' in priceResult)) {
      return res.status(400).json({ message: 'Error calculating price' });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productConfigId === productConfigId &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity = Number(cart.items[existingItemIndex].quantity) + Number(quantity);
    } else {
      // Add new item
      cart.items.push({
        productConfigId,
        quantity: Number(quantity),
        options,
        priceAtTime: priceResult.finalPrice
      });
    }

    await cart.save();
    const totals = await cart.calculateTotals();
    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productConfigId, quantity } = req.body;
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productConfigId === productConfigId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const totals = await cart.calculateTotals();
    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error });
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productConfigId } = req.params;
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productConfigId === productConfigId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    const totals = await cart.calculateTotals();
    res.json(totals);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error });
  }
}; 