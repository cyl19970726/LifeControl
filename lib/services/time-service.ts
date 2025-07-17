import { BlockService } from './block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'

interface ScheduleData {
  blockId: string
  scheduledAt: Date
  duration?: number
  recurrence?: 'daily' | 'weekly' | 'monthly'
  reminders?: number[]
}

interface TimeInfo {
  date: Date
  startTime?: string
  endTime?: string
  duration?: number
  recurrence?: string
  isAllDay?: boolean
}

export class TimeService {
  private blockService: BlockService

  constructor() {
    const embeddingService = new EmbeddingService()
    const vectorService = new VectorService(embeddingService)
    this.blockService = new BlockService(vectorService)
  }

  async scheduleTask(data: ScheduleData): Promise<any> {
    // Update block metadata with schedule information
    await this.blockService.updateBlockMetadata(data.blockId, {
      scheduledAt: data.scheduledAt,
      ...(data.duration && { duration: data.duration }),
      ...(data.recurrence && { recurrence: data.recurrence }),
      ...(data.reminders && { reminders: data.reminders })
    })

    return {
      blockId: data.blockId,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      recurrence: data.recurrence,
      reminders: data.reminders
    }
  }

  async parseTimeExpression(expression: string): Promise<TimeInfo> {
    const normalizedExpression = expression.toLowerCase().trim()
    const now = new Date()

    // Common time patterns
    const patterns = [
      // Today variations
      { pattern: /today(?:\s+at\s+)?(\d{1,2}(?::\d{2})?(?:\s*[ap]m)?)?/i, handler: this.handleToday },
      { pattern: /this\s+morning/i, handler: () => this.setTimeOfDay(now, 9) },
      { pattern: /this\s+afternoon/i, handler: () => this.setTimeOfDay(now, 14) },
      { pattern: /this\s+evening/i, handler: () => this.setTimeOfDay(now, 19) },
      { pattern: /tonight/i, handler: () => this.setTimeOfDay(now, 20) },
      
      // Tomorrow variations
      { pattern: /tomorrow(?:\s+at\s+)?(\d{1,2}(?::\d{2})?(?:\s*[ap]m)?)?/i, handler: this.handleTomorrow },
      { pattern: /tomorrow\s+morning/i, handler: () => this.setTimeOfDay(this.addDays(now, 1), 9) },
      { pattern: /tomorrow\s+afternoon/i, handler: () => this.setTimeOfDay(this.addDays(now, 1), 14) },
      { pattern: /tomorrow\s+evening/i, handler: () => this.setTimeOfDay(this.addDays(now, 1), 19) },
      
      // Next week/month
      { pattern: /next\s+week/i, handler: () => this.addDays(now, 7) },
      { pattern: /next\s+month/i, handler: () => this.addMonths(now, 1) },
      
      // In X time
      { pattern: /in\s+(\d+)\s+minutes?/i, handler: this.handleInMinutes },
      { pattern: /in\s+(\d+)\s+hours?/i, handler: this.handleInHours },
      { pattern: /in\s+(\d+)\s+days?/i, handler: this.handleInDays },
      
      // Specific days
      { pattern: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i, handler: this.handleWeekday },
      
      // Specific times
      { pattern: /(\d{1,2}(?::\d{2})?)\s*([ap]m)/i, handler: this.handleSpecificTime },
      
      // At X o'clock
      { pattern: /at\s+(\d{1,2})\s*o[''']?clock/i, handler: this.handleOClock }
    ]

    for (const { pattern, handler } of patterns) {
      const match = normalizedExpression.match(pattern)
      if (match) {
        const result = handler.call(this, match, now)
        if (result) {
          return {
            date: result,
            isAllDay: this.isAllDay(result)
          }
        }
      }
    }

    // Default: try to parse as date
    const parsedDate = new Date(expression)
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: parsedDate,
        isAllDay: this.isAllDay(parsedDate)
      }
    }

    throw new Error(`Unable to parse time expression: "${expression}"`)
  }

  async getTodaysSchedule(userId: string): Promise<any[]> {
    const todaysTasks = await this.blockService.getTodaysTasks(userId)
    
    // Sort by scheduled time
    return todaysTasks.sort((a, b) => {
      const timeA = (a.metadata as any)?.scheduledAt
      const timeB = (b.metadata as any)?.scheduledAt
      
      if (!timeA && !timeB) return 0
      if (!timeA) return 1
      if (!timeB) return -1
      
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })
  }

  async getUpcomingTasks(userId: string, days: number = 7): Promise<any[]> {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    
    const blocks = await this.blockService.getBlocksByUser(userId, {
      type: 'todo',
      limit: 100
    })

    return blocks.filter(block => {
      const metadata = block.metadata as any
      const scheduledAt = metadata?.scheduledAt
      const dueDate = metadata?.dueDate
      
      if (scheduledAt) {
        const scheduled = new Date(scheduledAt)
        return scheduled > new Date() && scheduled <= endDate
      }
      
      if (dueDate) {
        const due = new Date(dueDate)
        return due > new Date() && due <= endDate
      }
      
      return false
    }).sort((a, b) => {
      const getNextDate = (block: any) => {
        const metadata = block.metadata as any
        const scheduledAt = metadata?.scheduledAt
        const dueDate = metadata?.dueDate
        
        if (scheduledAt && dueDate) {
          return new Date(scheduledAt) < new Date(dueDate) ? scheduledAt : dueDate
        }
        
        return scheduledAt || dueDate
      }
      
      const dateA = getNextDate(a)
      const dateB = getNextDate(b)
      
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
  }

  async updateDashboard(userId: string): Promise<any> {
    const [todaysSchedule, upcomingTasks, stats] = await Promise.all([
      this.getTodaysSchedule(userId),
      this.getUpcomingTasks(userId, 7),
      this.blockService.getBlockStats(userId)
    ])

    return {
      todaysSchedule,
      upcomingTasks,
      stats,
      lastUpdated: new Date()
    }
  }

  async rescheduleTask(blockId: string, newScheduledAt: Date, reason?: string): Promise<any> {
    await this.blockService.updateBlockMetadata(blockId, {
      scheduledAt: newScheduledAt,
      ...(reason && { rescheduleReason: reason })
    })

    return {
      blockId,
      newScheduledAt,
      reason
    }
  }

  async markTaskComplete(blockId: string, completedAt: Date = new Date()): Promise<void> {
    // Update the todo block to mark as completed
    const block = await this.blockService.getBlock(blockId)
    if (block && block.type === 'todo') {
      const updatedContent = {
        ...block.content,
        checked: true
      }
      
      await this.blockService.updateBlock(blockId, {
        content: updatedContent
      })
      
      await this.blockService.updateBlockMetadata(blockId, {
        completedAt
      })
    }
  }

  async getTimeInsights(userId: string, period: 'week' | 'month' | 'quarter'): Promise<any> {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const blocks = await this.blockService.getBlocksByUser(userId, {
      limit: 1000
    })

    const completedTasks = blocks.filter(block => {
      const metadata = block.metadata as any
      const completedAt = metadata?.completedAt
      return completedAt && new Date(completedAt) >= startDate
    })

    const scheduledTasks = blocks.filter(block => {
      const metadata = block.metadata as any
      const scheduledAt = metadata?.scheduledAt
      return scheduledAt && new Date(scheduledAt) >= startDate
    })

    const insights = {
      period,
      totalTasks: blocks.length,
      completedTasks: completedTasks.length,
      scheduledTasks: scheduledTasks.length,
      completionRate: completedTasks.length / blocks.length,
      averageTasksPerDay: completedTasks.length / days,
      productivityTrend: this.calculateProductivityTrend(completedTasks, days),
      busyHours: this.calculateBusyHours(scheduledTasks),
      categories: this.analyzeCategories(blocks)
    }

    return insights
  }

  // Helper methods
  private handleToday(match: RegExpMatchArray, now: Date): Date {
    const timeStr = match[1]
    if (timeStr) {
      return this.parseTimeString(timeStr, now)
    }
    return now
  }

  private handleTomorrow(match: RegExpMatchArray, now: Date): Date {
    const tomorrow = this.addDays(now, 1)
    const timeStr = match[1]
    if (timeStr) {
      return this.parseTimeString(timeStr, tomorrow)
    }
    return tomorrow
  }

  private handleInMinutes(match: RegExpMatchArray, now: Date): Date {
    const minutes = parseInt(match[1])
    const result = new Date(now)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  private handleInHours(match: RegExpMatchArray, now: Date): Date {
    const hours = parseInt(match[1])
    const result = new Date(now)
    result.setHours(result.getHours() + hours)
    return result
  }

  private handleInDays(match: RegExpMatchArray, now: Date): Date {
    const days = parseInt(match[1])
    return this.addDays(now, days)
  }

  private handleWeekday(match: RegExpMatchArray, now: Date): Date {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = weekdays.indexOf(match[0].toLowerCase())
    const currentDay = now.getDay()
    
    let daysToAdd = targetDay - currentDay
    if (daysToAdd <= 0) {
      daysToAdd += 7 // Next week
    }
    
    return this.addDays(now, daysToAdd)
  }

  private handleSpecificTime(match: RegExpMatchArray, now: Date): Date {
    const timeStr = match[1]
    const ampm = match[2]
    return this.parseTimeString(`${timeStr} ${ampm}`, now)
  }

  private handleOClock(match: RegExpMatchArray, now: Date): Date {
    const hour = parseInt(match[1])
    const result = new Date(now)
    result.setHours(hour, 0, 0, 0)
    return result
  }

  private parseTimeString(timeStr: string, baseDate: Date): Date {
    const result = new Date(baseDate)
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)?/i)
    
    if (match) {
      let hour = parseInt(match[1])
      const minute = parseInt(match[2] || '0')
      const ampm = match[3]?.toLowerCase()
      
      if (ampm === 'pm' && hour !== 12) {
        hour += 12
      } else if (ampm === 'am' && hour === 12) {
        hour = 0
      }
      
      result.setHours(hour, minute, 0, 0)
    }
    
    return result
  }

  private setTimeOfDay(date: Date, hour: number): Date {
    const result = new Date(date)
    result.setHours(hour, 0, 0, 0)
    return result
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  private isAllDay(date: Date): boolean {
    return date.getHours() === 0 && date.getMinutes() === 0
  }

  private calculateProductivityTrend(completedTasks: any[], days: number): string {
    const recentDays = Math.min(days, 7)
    const recentTasks = completedTasks.filter(task => {
      const completedAt = new Date((task.metadata as any)?.completedAt)
      const recentThreshold = new Date()
      recentThreshold.setDate(recentThreshold.getDate() - recentDays)
      return completedAt >= recentThreshold
    })

    const recentAverage = recentTasks.length / recentDays
    const overallAverage = completedTasks.length / days

    if (recentAverage > overallAverage * 1.2) {
      return 'increasing'
    } else if (recentAverage < overallAverage * 0.8) {
      return 'decreasing'
    } else {
      return 'stable'
    }
  }

  private calculateBusyHours(scheduledTasks: any[]): Record<number, number> {
    const hourCounts: Record<number, number> = {}
    
    scheduledTasks.forEach(task => {
      const scheduledAt = new Date((task.metadata as any)?.scheduledAt)
      const hour = scheduledAt.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    return hourCounts
  }

  private analyzeCategories(blocks: any[]): Record<string, number> {
    const categoryCounts: Record<string, number> = {}
    
    blocks.forEach(block => {
      const category = (block.metadata as any)?.category || 'general'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    return categoryCounts
  }
}