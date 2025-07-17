// Test the chat API directly
async function testChatAPI() {
  console.log('🧪 Testing Chat API...\n')

  const testMessages = [
    "帮我创建一个健身计划页面",
    "Create a project page for learning TypeScript",
    "I want to track my daily habits"
  ]

  for (const [index, message] of testMessages.entries()) {
    console.log(`${index + 1}️⃣ Testing message: "${message}"`)
    
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'default-user',
          conversationId: 'test-conversation'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Response:', data.data.message)
        if (data.data.toolCalls && data.data.toolCalls.length > 0) {
          console.log('🔧 Tool calls:', data.data.toolCalls.length)
          data.data.toolCalls.forEach((call, i) => {
            console.log(`   ${i + 1}. ${call.toolCall?.name || 'Unknown tool'}`)
          })
        }
      } else {
        console.log('❌ Failed:', data.error)
      }
    } catch (error) {
      console.log('❌ Error:', error instanceof Error ? error.message : error)
    }
    
    console.log('') // Add spacing
  }

  console.log('🎉 Chat API testing completed!')
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/blocks?userId=default-user&limit=1')
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  if (!serverRunning) {
    console.log('❌ Server is not running on localhost:3000')
    console.log('Please start the server with: npm run dev')
    return
  }

  console.log('✅ Server is running')
  await testChatAPI()
}

main().catch(console.error)