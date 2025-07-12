"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Zap } from "lucide-react"

interface EnvCheckResult {
  success: boolean
  checks: {
    openaiKeyExists: boolean
    openaiKeyFormat: boolean
    openaiKeyLength: number
    serverSide: boolean
    nodeEnv: string
  }
  otherEnvs: Record<string, boolean>
  recommendations: string[]
}

interface OpenAITestResult {
  success: boolean
  message?: string
  response?: string
  error?: string
  solution?: string
  details?: string
}

export function EnvChecker() {
  const [envResult, setEnvResult] = useState<EnvCheckResult | null>(null)
  const [openaiResult, setOpenaiResult] = useState<OpenAITestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [testingOpenAI, setTestingOpenAI] = useState(false)

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/verify-env")
      const data = await response.json()
      setEnvResult(data)
    } catch (error) {
      console.error("Environment check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const testOpenAI = async () => {
    setTestingOpenAI(true)
    try {
      const response = await fetch("/api/test-openai", { method: "POST" })
      const data = await response.json()
      setOpenaiResult(data)
    } catch (error) {
      console.error("OpenAI test failed:", error)
      setOpenaiResult({
        success: false,
        error: "网络请求失败",
        solution: "请检查网络连接",
      })
    } finally {
      setTestingOpenAI(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            环境变量检查
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnvironment} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                检查中...
              </>
            ) : (
              "检查环境变量"
            )}
          </Button>

          {envResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">OpenAI API Key 检查</h4>
                  <div className="space-y-1">
                    {getStatusBadge(envResult.checks.openaiKeyExists, "API Key 存在")}
                    {getStatusBadge(envResult.checks.openaiKeyFormat, "格式正确 (sk-)")}
                    <Badge variant="outline">长度: {envResult.checks.openaiKeyLength} 字符</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">系统环境</h4>
                  <div className="space-y-1">
                    {getStatusBadge(envResult.checks.serverSide, "服务器端")}
                    <Badge variant="outline">NODE_ENV: {envResult.checks.nodeEnv}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">建议</h4>
                <div className="space-y-1">
                  {envResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm p-2 bg-slate-50 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {envResult?.checks.openaiKeyExists && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              OpenAI API 连接测试
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testOpenAI} disabled={testingOpenAI} className="w-full">
              {testingOpenAI ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试 OpenAI API"
              )}
            </Button>

            {openaiResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(openaiResult.success)}
                  <span className="font-medium">{openaiResult.success ? "连接成功！" : "连接失败"}</span>
                </div>

                {openaiResult.success ? (
                  <div className="space-y-2">
                    <p className="text-green-600">{openaiResult.message}</p>
                    {openaiResult.response && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium">AI 响应:</p>
                        <p className="text-sm">{openaiResult.response}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-600">{openaiResult.error}</p>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium">解决方案:</p>
                      <p className="text-sm">{openaiResult.solution}</p>
                      {openaiResult.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer">详细错误信息</summary>
                          <p className="text-xs mt-1 text-gray-600">{openaiResult.details}</p>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>设置指南</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <strong>1. 创建 .env.local 文件</strong>
            </p>
            <div className="bg-slate-100 p-2 rounded font-mono text-xs">OPENAI_API_KEY=sk-your-api-key-here</div>

            <p>
              <strong>2. 获取 OpenAI API Key</strong>
            </p>
            <p>
              访问{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                className="text-blue-600 underline"
                rel="noreferrer"
              >
                OpenAI API Keys
              </a>{" "}
              页面创建新的 API Key
            </p>

            <p>
              <strong>3. 重启开发服务器</strong>
            </p>
            <div className="bg-slate-100 p-2 rounded font-mono text-xs">npm run dev</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
