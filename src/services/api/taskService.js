// Import mock data
import tasksData from '../mockData/tasks.json'

// In-memory storage for tasks (in real app, this would be replaced with API calls)
let tasks = [...tasksData]

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

const taskService = {
  // Get all tasks
  async getAll() {
    await delay()
    return [...tasks]
  },

  // Get task by ID
  async getById(id) {
    await delay()
    const task = tasks.find(task => task.id === id)
    return task ? { ...task } : null
  },

  // Create new task
  async create(taskData) {
    await delay()
    
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      category: taskData.category || 'General',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      completedAt: null,
      archived: false,
      ...taskData
    }
    
    tasks.push(newTask)
    return { ...newTask }
  },

  // Update existing task
  async update(id, updateData) {
    await delay()
    
    const index = tasks.findIndex(task => task.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updateData,
      id // Ensure ID doesn't change
    }
    
    tasks[index] = updatedTask
    return { ...updatedTask }
  },

  // Delete task
  async delete(id) {
    await delay()
    
    const index = tasks.findIndex(task => task.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    const deletedTask = tasks[index]
    tasks.splice(index, 1)
    return { ...deletedTask }
  },

  // Additional methods for task management
  async getByCategory(category) {
    await delay()
    return tasks.filter(task => task.category === category).map(task => ({ ...task }))
  },

  async getByStatus(status) {
    await delay()
    return tasks.filter(task => task.status === status).map(task => ({ ...task }))
  },

  async archive(id) {
    await delay()
    return this.update(id, { archived: true })
  },

  async unarchive(id) {
    await delay()
    return this.update(id, { archived: false })
  }
}

export default taskService