import { Request, Response } from 'express';
import { ProductCategory, ProductConfig } from '../models';
import { Op } from 'sequelize';

// Product Category Controllers
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, configurationOptions } = req.body;
    const category = await ProductCategory.create({
      name,
      description,
      configurationOptions
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product category', error });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.findAll({
      include: ['configurations']
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product categories', error });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await ProductCategory.findByPk(req.params.id, {
      include: ['configurations']
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product category', error });
  }
};

// Product Configuration Controllers
export const createProductConfig = async (req: Request, res: Response) => {
  try {
    const { categoryId, options, basePrice } = req.body;
    
    // Verify category exists
    const category = await ProductCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if configuration already exists
    const existingConfig = await ProductConfig.findOne({
      where: {
        categoryId,
        options
      }
    });

    if (existingConfig) {
      return res.status(400).json({ message: 'Configuration already exists' });
    }

    const config = await ProductConfig.create({
      categoryId,
      options,
      basePrice
    });

    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product configuration', error });
  }
};

export const getProductConfigs = async (req: Request, res: Response) => {
  try {
    const { categoryId, oakType } = req.query;
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (oakType) {
      where.options = {
        [Op.contains]: { oakType }
      };
    }

    const configs = await ProductConfig.findAll({
      where,
      include: [{
        model: ProductCategory,
        as: 'category'
      }]
    });

    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product configurations', error });
  }
};

export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { categoryId, options } = req.body;

    // Find matching configuration
    const config = await ProductConfig.findOne({
      where: {
        categoryId,
        options: {
          [Op.contains]: options
        }
      }
    });

    if (!config) {
      return res.status(404).json({ message: 'No matching configuration found' });
    }

    let finalPrice = config.basePrice;

    // Apply dimension-based pricing for Oak Beams and Flooring
    const category = await ProductCategory.findByPk(categoryId);
    if (category?.name === 'Oak Beams' && options.dimensions) {
      const { length, width, thickness } = options.dimensions;
      const volume = (length * width * thickness) / 1000000; // Convert to cubic meters
      finalPrice = finalPrice * volume;
    } else if (category?.name === 'Oak Flooring' && options.dimensions) {
      const { length, width } = options.dimensions;
      const area = (length * width) / 10000; // Convert to square meters
      finalPrice = finalPrice * area;
    }

    res.json({
      basePrice: config.basePrice,
      finalPrice,
      configuration: config
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating price', error });
  }
};

export const updateProductConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { options, basePrice } = req.body;

    const config = await ProductConfig.findByPk(id);
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    await config.update({
      options,
      basePrice
    });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product configuration', error });
  }
};

export const deleteProductConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await ProductConfig.findByPk(id);
    
    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    await config.destroy();
    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product configuration', error });
  }
}; 