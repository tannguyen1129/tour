import Category from '../../models/Category.js';

export default {
  Query: {
    categories: async () => {
      return await Category.find({ isDeleted: false });
    },
    category: (_, { id }) => Category.findById(id)
  },
  Mutation: {
    createCategory: (_, { name, description }) => {
      return Category.create({ name, description });
    },
    updateCategory: async (_, { id, name, description }) => {
      const cat = await Category.findById(id);
      if (!cat) throw new Error('Category not found');
      if (name) cat.name = name;
      if (description) cat.description = description;
      await cat.save();
      return cat;
    },
    deleteCategory: async (_, { id }) => {
      const cat = await Category.findById(id);
      if (!cat) throw new Error('Category not found');
      cat.isDeleted = true;
      await cat.save();
      return true;
    }
  }
};
