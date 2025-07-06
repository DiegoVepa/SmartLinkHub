'use client'

import { useState, useEffect } from 'react'
import TaskEditModal from './TaskEditModal'
import ToastContainer from './ToastContainer'
import type { ToastMessage } from './Toast'

interface Task {
  id: number
  title: string
  description: string | null
  dueDate: string | null
  priority: string
  status: string
  project: string | null
  createdAt: string
  updatedAt: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [project, setProject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        console.error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, showToast: (toast: Omit<ToastMessage, 'id'>) => void) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter a task title')
      return
    }

    if (title.trim().length > 255) {
      alert('Title must be less than 255 characters')
      return
    }

    if (description && description.trim().length > 2000) {
      alert('Description must be less than 2000 characters')
      return
    }

    if (project && project.trim().length > 100) {
      alert('Project name must be less than 100 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description: description || null,
          dueDate: dueDate || null,
          priority,
          project: project || null
        }),
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks([newTask, ...tasks])
        setTitle('')
        setDescription('')
        setDueDate('')
        setPriority('medium')
        setProject('')
        showToast({
          type: 'success',
          title: 'Task Created!',
          message: `"${newTask.title}" has been added to your tasks.`
        })
      } else {
        const error = await response.json()
        showToast({
          type: 'error',
          title: 'Creation Failed',
          message: error.error || 'Failed to create task'
        })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to create task. Please check your connection.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTaskStatus = async (task: Task, showToast: (toast: Omit<ToastMessage, 'id'>) => void) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: task.id,
          status: newStatus
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t))
        showToast({
          type: 'success',
          title: newStatus === 'completed' ? 'Task Completed!' : 'Task Reopened',
          message: `"${task.title}" is now ${newStatus === 'completed' ? 'done' : 'pending'}.`
        })
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update task status.'
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to update task. Please check your connection.'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTask(null)
  }

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.project && task.project.toLowerCase().includes(searchQuery.toLowerCase()))

    // Status filter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter

    // Priority filter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

    // Project filter
    const matchesProject = projectFilter === 'all' || task.project === projectFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesProject
  })

  // Get unique projects for filter dropdown
  const availableProjects = [...new Set(tasks.map(task => task.project).filter(Boolean))]

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
  }

  // Bulk delete completed tasks
  const clearCompletedTasks = async (showToast: (toast: Omit<ToastMessage, 'id'>) => void) => {
    const completedTasks = tasks.filter(task => task.status === 'completed')
    
    if (completedTasks.length === 0) {
      showToast({
        type: 'info',
        title: 'No Completed Tasks',
        message: 'There are no completed tasks to clear.'
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed task${completedTasks.length === 1 ? '' : 's'}? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete all completed tasks
      const deletePromises = completedTasks.map(task => 
        fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(response => response.ok).length
      
      if (successCount === completedTasks.length) {
        setTasks(tasks.filter(task => task.status !== 'completed'))
        showToast({
          type: 'success',
          title: 'Tasks Cleared',
          message: `Successfully deleted ${successCount} completed task${successCount === 1 ? '' : 's'}.`
        })
      } else {
        showToast({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${successCount} of ${completedTasks.length} tasks. Some deletions failed.`
        })
        // Refresh to get current state
        fetchTasks()
      }
    } catch (error) {
      console.error('Error clearing completed tasks:', error)
      showToast({
        type: 'error',
        title: 'Bulk Delete Failed',
        message: 'Failed to clear completed tasks. Please try again.'
      })
    }
  }


  const TaskManagerContent = ({ showToast }: { showToast: (toast: Omit<ToastMessage, 'id'>) => void }) => (
    <div className="space-y-8">
      {/* Modern Header Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Personal Task Hub</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Organize your work, track your progress, and achieve your goals with our beautiful task management system.</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Tasks</p>
              <p className="text-3xl font-bold">{filteredTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <p className="text-3xl font-bold">{filteredTasks.filter(t => t.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">In Progress</p>
              <p className="text-3xl font-bold">{filteredTasks.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks, descriptions, or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">📋 Pending</option>
              <option value="in_progress">⏳ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Priority</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Project Filter */}
            {availableProjects.length > 0 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Projects</option>
                {availableProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            )}

            {/* Clear Filters Button */}
            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200 flex items-center gap-2"
                title="Clear all filters"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredTasks.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{tasks.length}</span> tasks
              {searchQuery && <span className="ml-2 text-blue-600">containing &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>
        )}
      </div>

      {/* Create Task Form - Modern Design */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
        </div>
        <form onSubmit={(e) => handleSubmit(e, showToast)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="What do you need to get done?"
              maxLength={255}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add more details about your task..."
              maxLength={2000}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="project" className="block text-sm font-semibold text-gray-700 mb-2">
                Project
              </label>
              <input
                type="text"
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Which project is this for?"
                maxLength={100}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Task...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Task
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Modern Task List */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
            </div>
            
            {/* Clear Completed Tasks Button */}
            {tasks.filter(t => t.status === 'completed').length > 0 && (
              <button
                onClick={() => clearCompletedTasks(showToast)}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-xl transition-all duration-200 flex items-center gap-2"
                title="Delete all completed tasks"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Clear {tasks.filter(t => t.status === 'completed').length} completed
              </button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-gray-600 text-lg">Loading your tasks...</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {tasks.length === 0 ? 'No tasks yet!' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {tasks.length === 0 
                ? 'Create your first task above to get started on your productivity journey.'
                : 'Try adjusting your search or filter criteria to find more tasks.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTaskStatus(task, showToast)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500 hover:bg-green-600' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <h3 className={`text-lg font-semibold transition-all duration-200 ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority === 'high' ? '🔴 High' :
                       task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'completed' ? '✅ Done' :
                       task.status === 'in_progress' ? '⏳ In Progress' : '📋 Pending'}
                    </span>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditTask(task)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  {task.project && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="font-medium">{task.project}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Due {formatDate(task.dueDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Created {formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        showToast={showToast}
      />
    </div>
  )

  return (
    <ToastContainer>
      {(showToast) => <TaskManagerContent showToast={showToast} />}
    </ToastContainer>
  )
}