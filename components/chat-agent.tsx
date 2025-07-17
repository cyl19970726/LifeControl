"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
// Remove old import
import { X, Send, Loader2, Wrench } from "lucide-react"
import { useClientTime } from "@/lib/utils/client-time"

// Component to safely display time without hydration errors
const TimeDisplay = ({ timestamp }: { timestamp: Date }) => {
  const timeString = useClientTime(timestamp)
  
  if (!timeString) {
    return <span className="text-xs opacity-70 mt-1 block">--:--</span>
  }
  
  return <span className="text-xs opacity-70 mt-1 block">{timeString}</span>
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolResults?: any[]
}

interface ChatAgentProps {
  onClose: () => void
  context?: {
    pageId?: string
    pageTitle?: string
    message?: string
  }
}

export function ChatAgent({ onClose, context }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your LifeAgent AI assistant. I can help you manage projects, set goals, add tasks, and write reflections. What can I help you with today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use new Tool+LLM+RAG API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId: 'default-user',
          conversationId: 'default',
          context: context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Unknown error')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.data.message,
        timestamp: new Date(),
        toolResults: data.data.toolCalls || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered some issues. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-slate-800">LifeAgent 智能助手</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%]">
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* 显示工具执行结果 */}
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.toolResults.map((result, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Wrench className="h-3 w-3" />
                        <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                          {result.toolName || 'Unknown tool'}
                        </Badge>
                        {result.success ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <TimeDisplay timestamp={message.timestamp} />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-slate-600">正在思考...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="告诉我你想要做什么..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">I can help you create projects, set goals, add tasks, or write reflections</p>
      </form>
    </div>
  )
}
