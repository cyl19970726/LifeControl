"use client"

import { TextBlock } from "./text-block"
import { HeadingBlock } from "./heading-block"
import { TodoBlock } from "./todo-block"
import { TableBlock } from "./table-block"
import { CalloutBlock } from "./callout-block"
import { PageBlock } from "./page-block"
import type { Block } from "@/lib/types/block"

interface BlockRendererProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function BlockRenderer({ block, mode = 'readonly', onUpdate }: BlockRendererProps) {
  const props = { block, mode, onUpdate }
  
  switch (block.type) {
    case 'text':
      return <TextBlock {...props} />
    case 'heading':
      return <HeadingBlock {...props} />
    case 'todo':
      return <TodoBlock {...props} />
    case 'table':
      return <TableBlock {...props} />
    case 'callout':
      return <CalloutBlock {...props} />
    case 'page':
      return <PageBlock {...props} />
    default:
      return (
        <div className="p-4 bg-gray-100 rounded text-gray-600">
          未知的块类型: {block.type}
        </div>
      )
  }
}