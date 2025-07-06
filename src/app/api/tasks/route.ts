import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueDate, priority, project } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required and must be a string' }, { status: 400 })
    }

    if (title.length > 255) {
      return NextResponse.json({ error: 'Title must be less than 255 characters' }, { status: 400 })
    }

    if (description && typeof description !== 'string') {
      return NextResponse.json({ error: 'Description must be a string' }, { status: 400 })
    }

    if (description && description.length > 2000) {
      return NextResponse.json({ error: 'Description must be less than 2000 characters' }, { status: 400 })
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json({ error: 'Priority must be low, medium, or high' }, { status: 400 })
    }

    if (project && typeof project !== 'string') {
      return NextResponse.json({ error: 'Project must be a string' }, { status: 400 })
    }

    if (project && project.length > 100) {
      return NextResponse.json({ error: 'Project name must be less than 100 characters' }, { status: 400 })
    }

    let parsedDueDate = null
    if (dueDate) {
      parsedDueDate = new Date(dueDate)
      if (isNaN(parsedDueDate.getTime())) {
        return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 })
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: parsedDueDate,
        priority: priority || 'medium',
        project: project?.trim() || null,
        userId
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, dueDate, priority, project, status } = body

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Task ID is required and must be a number' }, { status: 400 })
    }

    if (title && (typeof title !== 'string' || title.length > 255)) {
      return NextResponse.json({ error: 'Title must be a string with less than 255 characters' }, { status: 400 })
    }

    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 2000)) {
      return NextResponse.json({ error: 'Description must be a string with less than 2000 characters' }, { status: 400 })
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json({ error: 'Priority must be low, medium, or high' }, { status: 400 })
    }

    if (project !== undefined && project !== null && (typeof project !== 'string' || project.length > 100)) {
      return NextResponse.json({ error: 'Project must be a string with less than 100 characters' }, { status: 400 })
    }

    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Status must be pending, in_progress, or completed' }, { status: 400 })
    }

    let parsedDueDate = undefined
    if (dueDate !== undefined) {
      if (dueDate === null) {
        parsedDueDate = null
      } else {
        parsedDueDate = new Date(dueDate)
        if (isNaN(parsedDueDate.getTime())) {
          return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 })
        }
      }
    }

    const updateData: {
      title?: string
      description?: string | null
      dueDate?: Date | null
      priority?: string
      project?: string | null
      status?: string
    } = {}
    if (title) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (dueDate !== undefined) updateData.dueDate = parsedDueDate
    if (priority) updateData.priority = priority
    if (project !== undefined) updateData.project = project?.trim() || null
    if (status) updateData.status = status

    const task = await prisma.task.update({
      where: {
        id: id,
        userId: userId
      },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const parsedId = parseInt(id)
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Task ID must be a valid number' }, { status: 400 })
    }

    await prisma.task.delete({
      where: {
        id: parsedId,
        userId: userId
      }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}