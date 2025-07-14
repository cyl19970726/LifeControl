import { type NextRequest, NextResponse } from "next/server"
import { taskRepository } from "@/lib/db/repositories"

// 获取任务统计信息
export async function GET(request: NextRequest) {
  try {
    const userId = "temp-user-id" // TODO: 从认证中获取用户ID

    const stats = await taskRepository.getTaskStats(userId)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Failed to fetch task stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch task stats",
      },
      { status: 500 },
    )
  }
}
