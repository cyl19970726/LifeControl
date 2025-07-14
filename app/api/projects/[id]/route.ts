import { type NextRequest, NextResponse } from "next/server"
import { projectRepository } from "@/lib/db/repositories"

// 获取单个项目详情
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await projectRepository.findById(params.id)

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 },
      )
    }

    // 获取项目统计信息
    const stats = await projectRepository.getProjectStats(params.id)

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        stats,
      },
    })
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
      },
      { status: 500 },
    )
  }
}

// 更新项目
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.status) updateData.status = body.status
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)

    const project = await projectRepository.update(params.id, updateData)

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
      },
      { status: 500 },
    )
  }
}

// 删除项目
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await projectRepository.delete(params.id)

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
      },
      { status: 500 },
    )
  }
}
