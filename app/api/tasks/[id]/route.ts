import { type NextRequest, NextResponse } from "next/server"
import { taskRepository } from "@/lib/db/repositories"

// 获取单个任务详情
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await taskRepository.findById(params.id)

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("Failed to fetch task:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch task",
      },
      { status: 500 },
    )
  }
}

// 更新任务
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: any = {}
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.priority) updateData.priority = body.priority
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate)
    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed
      if (body.completed) {
        updateData.completedAt = new Date()
      } else {
        updateData.completedAt = null
      }
    }

    const task = await taskRepository.update(params.id, updateData)

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update task",
      },
      { status: 500 },
    )
  }
}

// 删除任务
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await taskRepository.delete(params.id)

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete task",
      },
      { status: 500 },
    )
  }
}
