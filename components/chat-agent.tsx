"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLifeAgentStore } from "@/lib/store"
import { X, Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatAgentProps {
  onClose: () => void
}

export function ChatAgent({ onClose }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your LifeAgent assistant. I can help you manage your goals, projects, and reflections. What would you like to work on today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { addProject, addGoal, addReview, addTask } = useLifeAgentStore()

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
      // Simulate AI processing and tool calling
      const response = await processUserInput(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      }

      // Execute any tool calls
      if (response.toolCalls) {
        for (const toolCall of response.toolCalls) {
          await executeTool(toolCall)
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processUserInput = async (input: string): Promise<{ message: string; toolCalls?: any[] }> => {
    // Simple intent recognition (in a real app, this would use AI SDK)
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("create project") || lowerInput.includes("new project")) {
      const projectName = extractProjectName(input)
      return {
        message: `I'll create a new project called "${projectName}" for you. This project will help you stay organized and track your progress.`,
        toolCalls: [
          {
            type: "addProject",
            data: {
              name: projectName,
              description: `Project created from conversation: ${input}`,
              status: "active",
              goals: [],
            },
          },
        ],
      }
    }

    if (lowerInput.includes("add goal") || lowerInput.includes("new goal")) {
      const goalTitle = extractGoalTitle(input)
      return {
        message: `I've added "${goalTitle}" as a new goal. This will help guide your projects and activities.`,
        toolCalls: [
          {
            type: "addGoal",
            data: {
              title: goalTitle,
              description: `Goal created from conversation: ${input}`,
              stage: "quarter",
            },
          },
        ],
      }
    }

    if (lowerInput.includes("reflect") || lowerInput.includes("review")) {
      return {
        message: `I'll help you create a reflection entry. What specific aspects would you like to reflect on?`,
        toolCalls: [
          {
            type: "addReview",
            data: {
              type: "daily",
              entries: [
                {
                  content: input,
                  tags: ["conversation", "reflection"],
                },
              ],
            },
          },
        ],
      }
    }

    if (lowerInput.includes("task") || lowerInput.includes("todo")) {
      const taskTitle = extractTaskTitle(input)
      return {
        message: `I've added "${taskTitle}" to your task list. You can find it in your dashboard.`,
        toolCalls: [
          {
            type: "addTask",
            data: {
              title: taskTitle,
              description: `Task created from conversation: ${input}`,
              dueDate: new Date().toISOString(),
              completed: false,
            },
          },
        ],
      }
    }

    return {
      message: `I understand you're saying: "${input}". I can help you with creating projects, setting goals, adding tasks, or reflecting on your progress. What would you like to focus on?`,
    }
  }

  const executeTool = async (toolCall: any) => {
    switch (toolCall.type) {
      case "addProject":
        addProject(toolCall.data)
        break
      case "addGoal":
        addGoal(toolCall.data)
        break
      case "addReview":
        addReview(toolCall.data)
        break
      case "addTask":
        addTask(toolCall.data)
        break
    }
  }

  const extractProjectName = (input: string): string => {
    const match = input.match(/(?:create|new)\s+project\s+(?:called\s+)?["']?([^"']+)["']?/i)
    return match ? match[1].trim() : "New Project"
  }

  const extractGoalTitle = (input: string): string => {
    const match = input.match(/(?:add|new)\s+goal\s+(?:to\s+)?["']?([^"']+)["']?/i)
    return match ? match[1].trim() : "New Goal"
  }

  const extractTaskTitle = (input: string): string => {
    const match = input.match(/(?:add|create|new)\s+task\s+(?:to\s+)?["']?([^"']+)["']?/i)
    return match ? match[1].trim() : "New Task"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-slate-800">LifeAgent Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">{message.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
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
            placeholder="Ask me anything about your goals, projects, or reflections..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
