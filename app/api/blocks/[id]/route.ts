import { NextRequest, NextResponse } from 'next/server'
import { BlockService } from '@/lib/services/block-service'
import { VectorService } from '@/lib/rag/vector-service'
import { EmbeddingService } from '@/lib/rag/embedding-service'

// Initialize services
const embeddingService = new EmbeddingService()
const vectorService = new VectorService(embeddingService)
const blockService = new BlockService(vectorService)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blockId = params.id
    
    if (!blockId) {
      return NextResponse.json(
        { success: false, error: 'Block ID is required' },
        { status: 400 }
      )
    }
    
    const block = await blockService.getBlock(blockId)
    
    if (!block) {
      return NextResponse.json(
        { success: false, error: 'Block not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: block
    })
  } catch (error) {
    console.error('Error fetching block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blockId = params.id
    const body = await request.json()
    
    if (!blockId) {
      return NextResponse.json(
        { success: false, error: 'Block ID is required' },
        { status: 400 }
      )
    }
    
    const updatedBlock = await blockService.updateBlock(blockId, body)
    
    return NextResponse.json({
      success: true,
      data: updatedBlock
    })
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blockId = params.id
    
    if (!blockId) {
      return NextResponse.json(
        { success: false, error: 'Block ID is required' },
        { status: 400 }
      )
    }
    
    await blockService.deleteBlock(blockId)
    
    return NextResponse.json({
      success: true,
      message: 'Block deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}