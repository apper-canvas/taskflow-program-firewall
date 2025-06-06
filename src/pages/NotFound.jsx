import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
      <div className="text-center">
        <div className="mb-8">
          <ApperIcon name="FileQuestion" size={120} className="mx-auto text-surface-300 dark:text-surface-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-4">
          404 - Page Not Found
        </h1>
        
        <p className="text-lg text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <ApperIcon name="Home" size={20} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound