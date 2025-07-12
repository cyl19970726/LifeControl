"use client"

import { EnvChecker } from "@/components/env-checker"

export default function EnvCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">环境变量检查</h1>
          <p className="text-slate-600">验证你的 .env.local 文件配置是否正确</p>
        </div>

        <EnvChecker />
      </div>
    </div>
  )
}
