import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksData, categoriesData] = await Promise.all([
          taskService.getAll(),
          categoryService.getAll()
        ])
        setTasks(tasksData || [])
        setCategories(categoriesData || [])
      } catch (err) {
        setError(err.message)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || task?.category === selectedCategory
    const matchesStatus = statusFilter === 'all' || task?.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const todoTasks = filteredTasks.filter(task => task?.status === 'todo')
  const inProgressTasks = filteredTasks.filter(task => task?.status === 'in-progress')
  const completedTasks = filteredTasks.filter(task => task?.status === 'completed')

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const result = await taskService.update(updatedTask.id, updatedTask)
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? result : task))
      toast.success('Task updated successfully')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const handleTaskCreate = async (newTask) => {
    try {
      const result = await taskService.create(newTask)
      setTasks(prev => [...prev, result])
      toast.success('Task created successfully')
    } catch (err) {
      toast.error('Failed to create task')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertTriangle" size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-200 mb-2">
            Something went wrong
          </h2>
          <p className="text-surface-600 dark:text-surface-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-800/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon name="Menu" size={20} className="text-surface-600 dark:text-surface-400" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckSquare" size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-surface-900 dark:text-white">TaskFlow</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <ApperIcon 
                  name="Search" 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" 
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-surface-900 dark:text-white placeholder-surface-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <ApperIcon name="X" size={16} className="text-surface-400 hover:text-surface-600" />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  size={20} 
                  className="text-surface-600 dark:text-surface-400" 
                />
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <ApperIcon name="Settings" size={20} className="text-surface-600 dark:text-surface-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 min-h-screen"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Categories</h2>
                
                {/* Filter Buttons */}
                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => { setSelectedCategory('all'); setStatusFilter('all') }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === 'all' && statusFilter === 'all'
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Inbox" size={16} />
                      <span>All Tasks</span>
                    </div>
                    <span className="text-sm bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded">
                      {tasks.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('todo')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      statusFilter === 'todo'
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Circle" size={16} />
                      <span>To Do</span>
                    </div>
                    <span className="text-sm bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded">
                      {todoTasks.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('in-progress')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      statusFilter === 'in-progress'
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="Clock" size={16} />
                      <span>In Progress</span>
                    </div>
                    <span className="text-sm bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded">
                      {inProgressTasks.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      statusFilter === 'completed'
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="CheckCircle" size={16} />
                      <span>Completed</span>
                    </div>
                    <span className="text-sm bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded">
                      {completedTasks.length}
                    </span>
                  </button>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  {(categories || []).map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded">
                        {category.taskCount || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <MainFeature
            tasks={filteredTasks}
            categories={categories}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskCreate={handleTaskCreate}
            todoTasks={todoTasks}
            inProgressTasks={inProgressTasks}
            completedTasks={completedTasks}
          />
        </main>
      </div>
    </div>
  )
}

export default Home