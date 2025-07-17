"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Layout, Grid3X3 } from "lucide-react"
import type { Block } from "@/lib/types/block"

interface PageBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function PageBlock({ block, mode = 'readonly' }: PageBlockProps) {
  const router = useRouter()
  const content = block.content as { 
    title: string
    description?: string
    childBlocks: string[]
    layout: 'default' | 'dashboard' | 'kanban' | 'calendar'
    visibility: 'private' | 'shared'
    icon?: string
    coverImage?: string
  }
  
  const layoutIcons = {
    default: FileText,
    dashboard: Layout,
    kanban: Grid3X3,
    calendar: Calendar
  }
  
  const LayoutIcon = layoutIcons[content.layout]
  
  const handleClick = () => {
    if (mode !== 'preview') return
    router.push(`/p/${block.id}`)
  }
  
  if (mode === 'preview') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {content.icon && <span className="text-2xl">{content.icon}</span>}
              <CardTitle className="text-lg">{content.title}</CardTitle>
            </div>
            <Badge variant={content.visibility === 'shared' ? 'default' : 'secondary'}>
              {content.visibility}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {content.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {content.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <LayoutIcon className="w-3 h-3" />
              <span>{content.layout}</span>
            </div>
            <div>
              {content.childBlocks.length} 个内容块
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // readonly 模式下只显示基本信息
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {content.icon && <span className="text-2xl">{content.icon}</span>}
          <CardTitle>{content.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {content.description && (
          <p className="text-gray-600 mb-4">{content.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Badge variant="outline">{content.layout} 布局</Badge>
          <Badge variant="outline">{content.visibility}</Badge>
          <span>{content.childBlocks.length} 个内容块</span>
        </div>
      </CardContent>
    </Card>
  )
}