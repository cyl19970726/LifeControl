"use client"

import type { Block } from "@/lib/types/block"

interface HeadingBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function HeadingBlock({ block, mode = 'readonly' }: HeadingBlockProps) {
  const content = block.content as { level: number; text: string; anchor?: string }
  
  const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements
  
  const headingClasses = {
    1: "text-3xl font-bold text-gray-900",
    2: "text-2xl font-semibold text-gray-800",
    3: "text-xl font-medium text-gray-700",
    4: "text-lg font-medium text-gray-600",
    5: "text-base font-medium text-gray-600",
    6: "text-sm font-medium text-gray-600"
  }
  
  if (mode === 'preview') {
    return (
      <div className={`${headingClasses[content.level as keyof typeof headingClasses]} line-clamp-1`}>
        {content.text}
      </div>
    )
  }
  
  return (
    <HeadingTag 
      id={content.anchor} 
      className={`${headingClasses[content.level as keyof typeof headingClasses]} mb-4`}
    >
      {content.text}
    </HeadingTag>
  )
}