import { tool } from 'ai'
import { z } from 'zod'
import { TimeService } from '../services/time-service'

// Initialize service
const timeService = new TimeService()

// Schedule Task Tool
export const scheduleTaskTool = tool({
  description: 'Schedule a task or block for a specific time',
  parameters: z.object({
    blockId: z.string(),
    scheduledAt: z.string(), // ISO date string
    duration: z.number().optional(), // Duration in minutes
    recurrence: z.enum(['daily', 'weekly', 'monthly']).optional(),
    reminders: z.array(z.number()).optional() // Reminder minutes before
  }),
  execute: async (params) => {
    try {
      const result = await timeService.scheduleTask({
        blockId: params.blockId,
        scheduledAt: new Date(params.scheduledAt),
        duration: params.duration,
        recurrence: params.recurrence,
        reminders: params.reminders
      })

      return {
        success: true,
        schedule: result,
        message: `Task scheduled for ${new Date(params.scheduledAt).toLocaleString()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to schedule task'
      }
    }
  }
})

// Parse Time Tool
export const parseTimeTool = tool({
  description: 'Parse natural language time expressions into structured time info',
  parameters: z.object({
    timeExpression: z.string() // e.g., "tomorrow at 3pm", "next week", "in 2 hours"
  }),
  execute: async (params) => {
    try {
      const timeInfo = await timeService.parseTimeExpression(params.timeExpression)

      return {
        success: true,
        timeInfo,
        message: `Parsed "${params.timeExpression}" successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to parse time expression: "${params.timeExpression}"`
      }
    }
  }
})

// Get Today's Schedule Tool
export const getTodaysScheduleTool = tool({
  description: 'Get today\'s scheduled tasks and events',
  parameters: z.object({
    userId: z.string()
  }),
  execute: async (params) => {
    try {
      const schedule = await timeService.getTodaysSchedule(params.userId)

      return {
        success: true,
        schedule,
        count: schedule.length,
        message: `Found ${schedule.length} scheduled items for today`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get today\'s schedule'
      }
    }
  }
})

// Get Upcoming Tasks Tool
export const getUpcomingTasksTool = tool({
  description: 'Get upcoming tasks and deadlines',
  parameters: z.object({
    userId: z.string(),
    days: z.number().min(1).max(30).default(7) // Number of days to look ahead
  }),
  execute: async (params) => {
    try {
      const tasks = await timeService.getUpcomingTasks(params.userId, params.days)

      return {
        success: true,
        tasks,
        count: tasks.length,
        message: `Found ${tasks.length} upcoming tasks in the next ${params.days} days`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get upcoming tasks'
      }
    }
  }
})

// Update Dashboard Tool
export const updateDashboardTool = tool({
  description: 'Update the dashboard with today\'s tasks and schedule',
  parameters: z.object({
    userId: z.string()
  }),
  execute: async (params) => {
    try {
      const dashboardData = await timeService.updateDashboard(params.userId)

      return {
        success: true,
        dashboardData,
        message: 'Dashboard updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update dashboard'
      }
    }
  }
})

// Reschedule Task Tool
export const rescheduleTaskTool = tool({
  description: 'Reschedule an existing task to a new time',
  parameters: z.object({
    blockId: z.string(),
    newScheduledAt: z.string(), // ISO date string
    reason: z.string().optional()
  }),
  execute: async (params) => {
    try {
      const result = await timeService.rescheduleTask(
        params.blockId,
        new Date(params.newScheduledAt),
        params.reason
      )

      return {
        success: true,
        schedule: result,
        message: `Task rescheduled to ${new Date(params.newScheduledAt).toLocaleString()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to reschedule task'
      }
    }
  }
})

// Mark Task Complete Tool
export const markTaskCompleteTool = tool({
  description: 'Mark a task as completed',
  parameters: z.object({
    blockId: z.string(),
    completedAt: z.string().optional() // ISO date string, defaults to now
  }),
  execute: async (params) => {
    try {
      const completedAt = params.completedAt ? new Date(params.completedAt) : new Date()
      await timeService.markTaskComplete(params.blockId, completedAt)

      return {
        success: true,
        completedAt,
        message: 'Task marked as completed'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to mark task as completed'
      }
    }
  }
})

// Get Time Insights Tool
export const getTimeInsightsTool = tool({
  description: 'Get insights about time usage and productivity patterns',
  parameters: z.object({
    userId: z.string(),
    period: z.enum(['week', 'month', 'quarter']).default('week')
  }),
  execute: async (params) => {
    try {
      const insights = await timeService.getTimeInsights(params.userId, params.period)

      return {
        success: true,
        insights,
        message: `Generated time insights for the last ${params.period}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to generate time insights'
      }
    }
  }
})

// Export all tools
export const timeTools = {
  scheduleTask: scheduleTaskTool,
  parseTime: parseTimeTool,
  getTodaysSchedule: getTodaysScheduleTool,
  getUpcomingTasks: getUpcomingTasksTool,
  updateDashboard: updateDashboardTool,
  rescheduleTask: rescheduleTaskTool,
  markTaskComplete: markTaskCompleteTool,
  getTimeInsights: getTimeInsightsTool
}