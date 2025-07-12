"use client"

import { EnvSetupHelper } from "@/components/env-setup-helper"

export default function EnvSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">环境变量设置助手</h1>
          <p className="text-slate-600">快速生成和配置 NextAuth 所需的环境变量</p>
        </div>

        <EnvSetupHelper />
      </div>
    </div>
  )
}
