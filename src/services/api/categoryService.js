// Import mock data
import categoriesData from '../mockData/categories.json'

// In-memory storage for categories
let categories = [...categoriesData]

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

const categoryService = {
  // Get all categories
  async getAll() {
    await delay()
    return [...categories]
  },

  // Get category by ID
  async getById(id) {
    await delay()
    const category = categories.find(cat => cat.id === id)
    return category ? { ...category } : null
  },

  // Create new category
  async create(categoryData) {
    await delay()
    
    const newCategory = {
      id: Date.now().toString(),
      name: categoryData.name || '',
      color: categoryData.color || '#3B82F6',
      taskCount: 0,
      ...categoryData
    }
    
    categories.push(newCategory)
    return { ...newCategory }
  },

  // Update existing category
  async update(id, updateData) {
    await delay()
    
    const index = categories.findIndex(cat => cat.id === id)
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    const updatedCategory = {
      ...categories[index],
      ...updateData,
      id // Ensure ID doesn't change
    }
    
    categories[index] = updatedCategory
    return { ...updatedCategory }
  },

  // Delete category
  async delete(id) {
    await delay()
    
    const index = categories.findIndex(cat => cat.id === id)
    if (index === -1) {
      throw new Error('Category not found')
    }
    
    const deletedCategory = categories[index]
    categories.splice(index, 1)
    return { ...deletedCategory }
  }
}

export default categoryService