import { type NextRequest, NextResponse } from "next/server"
import { BlockService } from "@/lib/services/block-service"
import { VectorService } from "@/lib/rag/vector-service"
import { EmbeddingService } from "@/lib/rag/embedding-service"

// Initialize services
const embeddingService = new EmbeddingService()
const vectorService = new VectorService(embeddingService)
const blockService = new BlockService(vectorService)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId") || "default-user"
    const type = searchParams.get("type") || undefined
    const category = searchParams.get("category") || undefined
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const ids = searchParams.get("ids")?.split(",") || undefined

    // If specific IDs are requested, use a different method
    if (ids && ids.length > 0) {
      const blocks = await Promise.all(
        ids.map(id => blockService.getBlock(id))
      )
      const validBlocks = blocks.filter(block => block !== null)
      
      return NextResponse.json({
        success: true,
        data: validBlocks,
        count: validBlocks.length
      })
    }

    const blocks = await blockService.getBlocksByUser(userId, {
      type,
      category,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data: blocks,
      count: blocks.length,
      total: await blockService.getBlockStats(userId).then(stats => stats.totalBlocks)
    })
  } catch (error) {
    console.error("Blocks API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = "default-user", ...blockData } = body

    const block = await blockService.createBlock({
      ...blockData,
      userId
    })

    return NextResponse.json({
      success: true,
      data: block
    })
  } catch (error) {
    console.error("Create block error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { blockId, ...updates } = body

    if (!blockId) {
      return NextResponse.json(
        {
          success: false,
          error: "Block ID is required"
        },
        { status: 400 }
      )
    }

    const block = await blockService.updateBlock(blockId, updates)

    return NextResponse.json({
      success: true,
      data: block
    })
  } catch (error) {
    console.error("Update block error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const blockId = searchParams.get("blockId")

    if (!blockId) {
      return NextResponse.json(
        {
          success: false,
          error: "Block ID is required"
        },
        { status: 400 }
      )
    }

    await blockService.deleteBlock(blockId)

    return NextResponse.json({
      success: true,
      message: "Block deleted successfully"
    })
  } catch (error) {
    console.error("Delete block error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}