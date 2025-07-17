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
    const query = searchParams.get("q")
    const userId = searchParams.get("userId") || "default-user"
    const type = searchParams.get("type") || undefined
    const category = searchParams.get("category") || undefined
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required"
        },
        { status: 400 }
      )
    }

    const results = await blockService.searchBlocks(query, userId, {
      type,
      category,
      limit
    })

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      query
    })
  } catch (error) {
    console.error("Search API error:", error)
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
    const { query, userId = "default-user", type, category, limit = 10 } = body

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required"
        },
        { status: 400 }
      )
    }

    // Perform semantic search
    const results = await blockService.searchBlocks(query, userId, {
      type,
      category,
      limit
    })

    // Also get similar blocks if there's a reference block
    const { referenceBlockId } = body
    let similarBlocks: any[] = []
    
    if (referenceBlockId) {
      similarBlocks = await vectorService.searchSimilar(referenceBlockId, {
        userId,
        limit: 5
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        searchResults: results,
        similarBlocks,
        query
      }
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}