"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import type { Block } from "@/lib/types/block"

interface CalloutBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function CalloutBlock({ block, mode = 'readonly' }: CalloutBlockProps) {
  const content = block.content as { type: 'info' | 'warning' | 'error' | 'success'; text: string; icon?: string }
  
  const typeConfig = {
    info: {
      icon: InfoIcon,
      className: "border-blue-200 bg-blue-50 text-blue-900"
    },
    warning: {
      icon: AlertTriangle,
      className: "border-yellow-200 bg-yellow-50 text-yellow-900"
    },
    error: {
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-900"
    },
    success: {
      icon: CheckCircle,
      className: "border-green-200 bg-green-50 text-green-900"
    }
  }
  
  const config = typeConfig[content.type]
  const Icon = config.icon
  
  if (mode === 'preview') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4" />
        <span className="line-clamp-1">{content.text}</span>
      </div>
    )
  }
  
  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="ml-2">
        {content.text}
      </AlertDescription>
    </Alert>
  )
}