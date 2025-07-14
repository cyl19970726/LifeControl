import { type NextRequest, NextResponse } from "next/server"
import { projectRepository } from "@/lib/db/repositories"

// 获取所有项目
export async function GET(request: NextRequest) {
  try {
    // TODO: 从认证中获取用户ID
    const userId = "temp-user-id" // 临时用户ID，后续需要从认证中获取

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let projects
    if (status) {
      projects = await projectRepository.findByStatus(userId, status)
    } else {
      projects = await projectRepository.findByUserId(userId)
    }

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 },
    )
  }
}

// 创建新项目
export async function POST(request: NextRequest) {
  try {
    const userId = "temp-user-id" // 临时用户ID
    const body = await request.json()

    const project = await projectRepository.create({
      name: body.name,
      description: body.description,
      status: body.status || "ACTIVE",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      user: { connect: { id: userId } },
      goals: body.goalIds
        ? {
            connect: body.goalIds.map((id: string) => ({ id })),
          }
        : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
      },
      { status: 500 },
    )
  }
}
