"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Block } from "@/lib/types/block"

interface TodoBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function TodoBlock({ block, mode = 'readonly', onUpdate }: TodoBlockProps) {
  const content = block.content as { text: string; checked: boolean; priority?: 'high' | 'medium' | 'low' }
  const [checked, setChecked] = useState(content.checked)
  
  const handleCheck = () => {
    if (mode === 'readonly' || !onUpdate) return
    
    const newChecked = !checked
    setChecked(newChecked)
    
    onUpdate({
      ...block,
      content: { ...content, checked: newChecked },
      metadata: {
        ...block.metadata,
        completedAt: newChecked ? new Date() : undefined
      }
    })
  }
  
  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800", 
    low: "bg-green-100 text-green-800"
  }
  
  if (mode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Checkbox checked={checked} disabled />
        <span className={checked ? 'line-through text-gray-400' : 'text-gray-600'}>
          {content.text}
        </span>
      </div>
    )
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={checked}
          onCheckedChange={handleCheck}
          disabled={mode === 'readonly'}
          className="mt-0.5"
        />
        <div className="flex-1 space-y-1">
          <p className={checked ? 'line-through text-gray-400' : ''}>
            {content.text}
          </p>
          {content.priority && (
            <Badge variant="secondary" className={priorityColors[content.priority]}>
              {content.priority}
            </Badge>
          )}
        </div>
      </div>
      {block.metadata.dueDate && (
        <div className="mt-2 text-xs text-gray-500">
          到期: {new Date(block.metadata.dueDate).toLocaleDateString()}
        </div>
      )}
    </Card>
  )
}