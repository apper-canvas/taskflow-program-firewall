import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isOverdue } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = ({ 
  tasks, 
  categories, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate,
  todoTasks,
  inProgressTasks,
  completedTasks 
}) => {
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [quickAddValue, setQuickAddValue] = useState('')
  const [quickAddPriority, setQuickAddPriority] = useState('medium')
  const [quickAddCategory, setQuickAddCategory] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo'
  })

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      status: 'todo'
    })
    setEditingTask(null)
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!quickAddValue.trim()) return

    const newTask = {
      title: quickAddValue.trim(),
      description: '',
      category: quickAddCategory || (categories[0]?.name || 'General'),
      priority: quickAddPriority,
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      completedAt: null,
      archived: false
    }

    await onTaskCreate(newTask)
    setQuickAddValue('')
    setQuickAddPriority('medium')
    setQuickAddCategory('')
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskData = {
      ...taskForm,
      title: taskForm.title.trim(),
      dueDate: taskForm.dueDate || new Date().toISOString().split('T')[0],
      category: taskForm.category || (categories[0]?.name || 'General'),
      createdAt: editingTask ? editingTask.createdAt : new Date(),
      completedAt: taskForm.status === 'completed' ? new Date() : null,
      archived: false
    }

    if (editingTask) {
      await onTaskUpdate({ ...editingTask, ...taskData })
    } else {
      await onTaskCreate(taskData)
    }

    setShowTaskModal(false)
    resetForm()
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      category: task.category || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      status: task.status || 'todo'
    })
    setShowTaskModal(true)
  }

  const handleStatusChange = async (task, newStatus) => {
    const updatedTask = {
      ...task,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : null
    }
    await onTaskUpdate(updatedTask)
    
    if (newStatus === 'completed') {
      toast.success('🎉 Task completed!')
    }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      await handleStatusChange(draggedTask, newStatus)
    }
    setDraggedTask(null)
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isOverdue(date)) return 'Overdue'
    
    return format(date, 'MMM d')
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-surface-600 bg-surface-100 dark:bg-surface-700'
    }
  }

  const TaskCard = ({ task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className={`bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700 shadow-card hover:shadow-lg transition-all duration-200 cursor-move priority-${task.priority}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-surface-900 dark:text-white text-sm leading-tight flex-1 mr-2">
          {task.title}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleEditTask(task)}
            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <ApperIcon name="Edit2" size={14} className="text-surface-400" />
          </button>
          <button
            onClick={() => onTaskDelete(task.id)}
            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <ApperIcon name="Trash2" size={14} className="text-surface-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.category && (
            <span className="text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-2 py-1 rounded-full">
              {task.category}
            </span>
          )}
        </div>
        
        {task.dueDate && (
          <span className={`text-xs ${
            isOverdue(new Date(task.dueDate)) ? 'text-red-600' : 'text-surface-500 dark:text-surface-400'
          }`}>
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center space-x-2">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task, e.target.value)}
          className="text-xs bg-transparent border border-surface-200 dark:border-surface-600 rounded px-2 py-1 text-surface-700 dark:text-surface-300 focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </motion.div>
  )

  const EmptyColumn = ({ title, icon }) => (
    <div className="text-center py-12">
      <ApperIcon name={icon} size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
      <p className="text-surface-500 dark:text-surface-400 text-sm">No {title.toLowerCase()} tasks</p>
    </div>
  )

  return (
    <div className="p-6">
      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="mb-8">
        <div className="flex items-center space-x-4 bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card border border-surface-200 dark:border-surface-700">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a new task..."
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              className="w-full bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none"
            />
          </div>
          
          <select
            value={quickAddPriority}
            onChange={(e) => setQuickAddPriority(e.target.value)}
            className="bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-700 dark:text-surface-300 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={quickAddCategory}
            onChange={(e) => setQuickAddCategory(e.target.value)}
            className="bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-700 dark:text-surface-300 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Select Category</option>
            {(categories || []).map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!quickAddValue.trim()}
            className="bg-primary hover:bg-primary-dark disabled:bg-surface-300 dark:disabled:bg-surface-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <ApperIcon name="Plus" size={20} />
          </button>
        </div>
      </form>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div 
          className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'todo')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900 dark:text-white flex items-center space-x-2">
              <div className="w-3 h-3 bg-surface-400 rounded-full"></div>
              <span>To Do</span>
              <span className="text-sm bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded-full">
                {todoTasks.length}
              </span>
            </h2>
            <button
              onClick={() => setShowTaskModal(true)}
              className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors"
            >
              <ApperIcon name="Plus" size={16} className="text-surface-600 dark:text-surface-400" />
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {todoTasks.length > 0 ? (
                todoTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <EmptyColumn title="To Do" icon="Circle" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* In Progress Column */}
        <div 
          className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'in-progress')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900 dark:text-white flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span>In Progress</span>
              <span className="text-sm bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded-full">
                {inProgressTasks.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <EmptyColumn title="In Progress" icon="Clock" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Completed Column */}
        <div 
          className="bg-surface-100 dark:bg-surface-800 rounded-xl p-4 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'completed')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900 dark:text-white flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Completed</span>
              <span className="text-sm bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded-full">
                {completedTasks.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {completedTasks.length > 0 ? (
                completedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <EmptyColumn title="Completed" icon="CheckCircle" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setShowTaskModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <ApperIcon name="Plus" size={24} />
      </motion.button>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowTaskModal(false); resetForm() }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-xl p-6 w-full max-w-md glassmorphism dark:glassmorphism-dark"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => { setShowTaskModal(false); resetForm() }}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} className="text-surface-500" />
                </button>
              </div>

              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Category
                    </label>
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {(categories || []).map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowTaskModal(false); resetForm() }}
                    className="flex-1 px-4 py-2 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  >
                    {editingTask ? 'Update' : 'Create'} Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature