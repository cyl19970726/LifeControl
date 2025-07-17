"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatAgent } from "@/components/chat-agent"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { Bot, Sparkles, MessageSquare, Target, FolderOpen, BookOpen, Calendar } from "lucide-react"
import type { Block } from "@/lib/types/block"

export default function HomePage() {
  const [showChat, setShowChat] = useState(true) // 默认显示聊天界面
  const [selectedView, setSelectedView] = useState<'overview' | 'insights' | 'activities'>('overview')
  const [pageBlocks, setPageBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  // 加载页面 blocks
  useEffect(() => {
    const loadPageBlocks = async () => {
      try {
        const response = await fetch('/api/blocks?type=page&userId=default-user&limit=10')
        if (response.ok) {
          const data = await response.json()
          setPageBlocks(data.data)
        }
      } catch (error) {
        console.error('Failed to load page blocks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPageBlocks()
  }, [])

  // AI Agent 建议的快速操作
  const aiSuggestions = [
    {
      icon: Target,
      title: "创建目标页面",
      description: "告诉我你的目标，AI 会自动创建一个完整的目标管理页面",
      prompt: "帮我创建一个新目标页面，我想要..."
    },
    {
      icon: FolderOpen,
      title: "创建项目页面",
      description: "描述你的项目，AI 会自动生成项目管理页面和任务清单",
      prompt: "帮我创建一个项目页面，项目是关于..."
    },
    {
      icon: BookOpen,
      title: "创建回顾页面",
      description: "分享你的想法，AI 会创建个人回顾和反思页面",
      prompt: "帮我创建一个回顾页面，我想要记录..."
    },
    {
      icon: Calendar,
      title: "创建计划页面",
      description: "告诉我你的计划，AI 会创建时间管理和任务调度页面",
      prompt: "帮我创建一个计划页面，我需要安排..."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen">
        {/* 左侧：AI Agent 中心区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部导航 */}
          <div className="bg-white/80 backdrop-blur-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">LifeAgent</h1>
                  <p className="text-sm text-slate-600">你的AI人生管理助手</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedView === 'overview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('overview')}
                >
                  概览
                </Button>
                <Button
                  variant={selectedView === 'insights' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('insights')}
                >
                  洞察
                </Button>
                <Button
                  variant={selectedView === 'activities' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('activities')}
                >
                  活动
                </Button>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* AI 快速操作建议 */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI 建议的快速操作
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestions.map((suggestion, index) => (
                      <Card 
                        key={index} 
                        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                        onClick={() => {
                          setShowChat(true)
                          // 这里可以预填充聊天内容
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                              <suggestion.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800 mb-1">{suggestion.title}</h3>
                              <p className="text-sm text-slate-600">{suggestion.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 我的页面 */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">我的页面</h2>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : pageBlocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pageBlocks.map((block) => (
                        <BlockRenderer 
                          key={block.id} 
                          block={block} 
                          mode="preview"
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-2 border-dashed border-slate-300">
                      <CardContent className="p-8 text-center">
                        <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">还没有任何页面</h3>
                        <p className="text-slate-500 mb-4">与 AI 对话来创建你的第一个页面</p>
                        <Button 
                          onClick={() => setShowChat(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          创建页面
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* 今日焦点 */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">今日焦点</h2>
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Bot className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">准备好开始了吗？</h3>
                        <p className="text-slate-600 mb-4">告诉我你今天想要完成什么，或者询问任何关于你的目标和项目的问题。</p>
                        <Button 
                          onClick={() => setShowChat(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          开始对话
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedView === 'insights' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 mb-2">AI 洞察分析</h3>
                  <p className="text-slate-500 mb-6">通过对话告诉我你的情况，我来为你提供个性化的洞察和建议</p>
                  <Button 
                    onClick={() => setShowChat(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    开始分析
                  </Button>
                </div>
              </div>
            )}

            {selectedView === 'activities' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 mb-2">最近活动</h3>
                  <p className="text-slate-500 mb-6">与我对话来回顾你的活动记录和进展情况</p>
                  <Button 
                    onClick={() => setShowChat(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    查看活动
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：聊天界面 */}
        {showChat && (
          <div className="w-96 bg-white border-l flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">AI Assistant</h3>
                    <p className="text-xs text-slate-600">随时为您服务</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowChat(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <ChatAgent onClose={() => setShowChat(false)} />
            </div>
          </div>
        )}

        {/* 浮动聊天按钮 (当聊天界面关闭时显示) */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Bot className="w-6 h-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
