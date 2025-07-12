"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Key, Globe, CheckCircle } from "lucide-react"

export function EnvSetupHelper() {
  const [generatedSecret, setGeneratedSecret] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const generateSecret = () => {
    // 生成32字节的随机密钥
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const secret = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
    setGeneratedSecret(secret)
  }

  const detectCurrentUrl = () => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const generateEnvFile = () => {
    const envContent = `# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# NextAuth 配置
NEXTAUTH_SECRET=${generatedSecret || "your-generated-secret-here"}
NEXTAUTH_URL=${currentUrl || "http://localhost:3000"}

# 数据库（可选）
# DATABASE_URL=postgresql://username:password@localhost:5432/lifeagent`

    return envContent
  }

  return (
    <div className="space-y-6">
      {/* NEXTAUTH_SECRET 生成器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            生成 NEXTAUTH_SECRET
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            NextAuth.js 需要一个安全的密钥来加密会话数据。点击下面的按钮生成一个随机密钥。
          </p>

          <Button onClick={generateSecret} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            生成安全密钥
          </Button>

          {generatedSecret && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">生成的密钥</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedSecret, "secret")}>
                  {copied === "secret" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg font-mono text-sm break-all">{generatedSecret}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEXTAUTH_URL 设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            设置 NEXTAUTH_URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            这是你的应用程序的完整 URL。对于本地开发，通常是 http://localhost:3000
          </p>

          <Button onClick={detectCurrentUrl} variant="outline" className="w-full bg-transparent">
            <Globe className="h-4 w-4 mr-2" />
            检测当前 URL
          </Button>

          {currentUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">检测到的 URL</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentUrl, "url")}>
                  {copied === "url" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg font-mono text-sm">{currentUrl}</div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">或手动输入 URL:</label>
            <Input
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
          </div>
        </CardContent>
      </Card>

      {/* 完整的 .env.local 文件 */}
      {(generatedSecret || currentUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>完整的 .env.local 文件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">复制下面的内容到你的 .env.local 文件中：</p>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => copyToClipboard(generateEnvFile(), "env")}
              >
                {copied === "env" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto">
                {generateEnvFile()}
              </pre>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">下一步：</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. 将上面的内容保存到项目根目录的 .env.local 文件</li>
                <li>2. 替换 OPENAI_API_KEY 为你的实际 API Key</li>
                <li>3. 重启开发服务器：npm run dev</li>
                <li>4. 访问 /env-check 页面验证配置</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 不同环境的示例 */}
      <Card>
        <CardHeader>
          <CardTitle>不同环境的 NEXTAUTH_URL 示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <Badge variant="outline" className="mb-1">
                本地开发
              </Badge>
              <div className="font-mono bg-slate-100 p-2 rounded">NEXTAUTH_URL=http://localhost:3000</div>
            </div>

            <div>
              <Badge variant="outline" className="mb-1">
                Vercel 部署
              </Badge>
              <div className="font-mono bg-slate-100 p-2 rounded">NEXTAUTH_URL=https://your-app.vercel.app</div>
            </div>

            <div>
              <Badge variant="outline" className="mb-1">
                自定义域名
              </Badge>
              <div className="font-mono bg-slate-100 p-2 rounded">NEXTAUTH_URL=https://lifeagent.yourdomain.com</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
