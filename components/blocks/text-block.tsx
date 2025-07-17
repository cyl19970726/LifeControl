"use client"

import { Card } from "@/components/ui/card"
import type { Block } from "@/lib/types/block"

interface TextBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function TextBlock({ block, mode = 'readonly' }: TextBlockProps) {
  const content = block.content as { text: string; formatting?: Record<string, any> }
  
  if (mode === 'preview') {
    return (
      <div className="text-sm text-gray-600 line-clamp-2">
        {content.text}
      </div>
    )
  }
  
  return (
    <Card className="p-4">
      <p className="whitespace-pre-wrap">{content.text}</p>
      {block.metadata.aiGenerated && (
        <div className="mt-2 text-xs text-gray-500">
          🤖 AI 生成
        </div>
      )}
    </Card>
  )
}