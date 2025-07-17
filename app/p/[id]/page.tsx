"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { ChatAgent } from "@/components/chat-agent"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bot, MessageSquare } from "lucide-react"
import type { Block } from "@/lib/types/block"

export default function PageBlock() {
  const params = useParams()
  const router = useRouter()
  const [pageBlock, setPageBlock] = useState<Block | null>(null)
  const [childBlocks, setChildBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // 获取页面 block
        const pageRes = await fetch(`/api/blocks/${params.id}`)
        if (!pageRes.ok) throw new Error("Page not found")
        
        const pageData = await pageRes.json()
        if (pageData.data.type !== 'page') {
          throw new Error("Not a page block")
        }
        
        setPageBlock(pageData.data)
        
        // 获取子 blocks
        if (pageData.data.content.childBlocks?.length > 0) {
          const childRes = await fetch(`/api/blocks?ids=${pageData.data.content.childBlocks.join(',')}`)
          if (childRes.ok) {
            const childData = await childRes.json()
            setChildBlocks(childData.data)
          }
        }
      } catch (error) {
        console.error("Failed to load page:", error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    loadPageData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!pageBlock) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen">
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 页面头部 */}
          <div className="bg-white/80 backdrop-blur-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {pageBlock.content.icon} {pageBlock.content.title}
                  </h1>
                  {pageBlock.content.description && (
                    <p className="text-sm text-slate-600">{pageBlock.content.description}</p>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI 助手
              </Button>
            </div>
          </div>

          {/* 页面内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {childBlocks.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">页面还没有内容</h3>
                  <p className="text-slate-500 mb-6">与 AI 对话来添加内容到这个页面</p>
                  <Button onClick={() => setShowChat(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    开始对话
                  </Button>
                </div>
              ) : (
                childBlocks.map((block) => (
                  <BlockRenderer 
                    key={block.id} 
                    block={block}
                    mode="readonly"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 聊天界面 */}
        {showChat && (
          <div className="w-96 bg-white border-l flex flex-col">
            <ChatAgent 
              onClose={() => setShowChat(false)} 
              context={{
                pageId: pageBlock.id,
                pageTitle: pageBlock.content.title,
                message: `我正在查看"${pageBlock.content.title}"页面`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}