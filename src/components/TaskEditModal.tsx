'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

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

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: number) => void
  showToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, onDelete, showToast }: TaskEditModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('pending')
  const [project, setProject] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setPriority(task.priority)
      setStatus(task.status)
      setProject(task.project || '')
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!task || !title.trim()) {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: task.id,
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          priority,
          status,
          project: project.trim() || null
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onSave(updatedTask)
        showToast({
          type: 'success',
          title: 'Task Updated!',
          message: `"${updatedTask.title}" has been updated successfully.`
        })
        onClose()
      } else {
        const error = await response.json()
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: error.error || 'Failed to update task'
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(task.id)
        showToast({
          type: 'success',
          title: 'Task Deleted',
          message: `"${task.title}" has been permanently deleted.`
        })
        onClose()
      } else {
        const error = await response.json()
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: error.error || 'Failed to delete task'
        })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="What do you need to get done?"
              maxLength={255}
              required
              disabled={isSubmitting || isDeleting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add more details about your task..."
              maxLength={2000}
              disabled={isSubmitting || isDeleting}
            />
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Due Date */}
            <div>
              <label htmlFor="edit-dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="edit-dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting || isDeleting}
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="edit-priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting || isDeleting}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="edit-status" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isSubmitting || isDeleting}
              >
                <option value="pending">📋 Pending</option>
                <option value="in_progress">⏳ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Project */}
          <div>
            <label htmlFor="edit-project" className="block text-sm font-semibold text-gray-700 mb-2">
              Project
            </label>
            <input
              type="text"
              id="edit-project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Which project is this for?"
              maxLength={100}
              disabled={isSubmitting || isDeleting}
            />
          </div>

          {/* Task Metadata */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Task Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(task.updatedAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="sm:order-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Task
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="sm:order-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting || isDeleting || !title.trim()}
              className="sm:order-3 flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v4a1 1 0 11-2 0V4H7v4a1 1 0 11-2 0V4z" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}