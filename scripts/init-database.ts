#!/usr/bin/env node

import { db } from '../lib/db/client'
import { TemplateService } from '../lib/services/template-service'

async function initDatabase() {
  console.log('🚀 Initializing LifeAgent database...')
  
  try {
    // Create default user
    console.log('👤 Creating default user...')
    const defaultUser = await db.user.upsert({
      where: { email: 'default@lifeagent.com' },
      update: {
        name: 'Default User'
      },
      create: {
        email: 'default@lifeagent.com',
        name: 'Default User'
      }
    })
    
    console.log(`✅ Default user created: ${defaultUser.email}`)
    
    // Initialize template service
    const templateService = new TemplateService()
    
    // Create default templates
    console.log('📋 Creating default templates...')
    await templateService.createDefaultTemplates(defaultUser.id)
    
    // Create additional useful templates
    console.log('📝 Creating additional templates...')
    
    // Fitness Plan Template
    await templateService.createTemplate({
      name: 'Fitness Plan Template',
      description: 'Track your fitness goals and progress',
      category: 'project',
      icon: '💪',
      tags: ['fitness', 'health', 'goals'],
      structure: {
        blocks: [
          {
            type: 'heading',
            content: { level: 1, text: 'Fitness Plan' },
            position: 0,
            required: true,
            customizable: true,
            aiPrompt: 'Generate a motivating fitness plan title'
          },
          {
            type: 'text',
            content: { text: 'My fitness goals and objectives...' },
            position: 1,
            required: true,
            customizable: true,
            aiPrompt: 'Generate specific, measurable fitness goals'
          },
          {
            type: 'table',
            content: {
              headers: ['Exercise', 'Sets', 'Reps', 'Weight', 'Notes'],
              rows: [
                ['Push-ups', '3', '10', 'Bodyweight', ''],
                ['Squats', '3', '15', 'Bodyweight', '']
              ]
            },
            position: 2,
            required: true,
            customizable: true,
            aiPrompt: 'Create a workout routine table based on user goals'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Progress Tracking' },
            position: 3,
            required: false,
            customizable: true
          },
          {
            type: 'table',
            content: {
              headers: ['Date', 'Activity', 'Duration', 'Intensity', 'Notes'],
              rows: []
            },
            position: 4,
            required: false,
            customizable: true
          }
        ]
      },
      userId: defaultUser.id,
      isPublic: true
    })
    
    // Weekly Review Template
    await templateService.createTemplate({
      name: 'Weekly Review Template',
      description: 'Comprehensive weekly reflection and planning',
      category: 'review',
      icon: '📊',
      tags: ['review', 'weekly', 'reflection', 'planning'],
      structure: {
        blocks: [
          {
            type: 'heading',
            content: { level: 1, text: 'Week of {{date}} - Weekly Review' },
            position: 0,
            required: true,
            customizable: true,
            aiPrompt: 'Generate weekly review title with current date'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Key Accomplishments' },
            position: 1,
            required: true,
            customizable: false
          },
          {
            type: 'text',
            content: { text: 'This week I accomplished...' },
            position: 2,
            required: false,
            customizable: true,
            aiPrompt: 'Summarize weekly accomplishments from user input'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Challenges and Learnings' },
            position: 3,
            required: true,
            customizable: false
          },
          {
            type: 'text',
            content: { text: 'Key challenges I faced and what I learned...' },
            position: 4,
            required: false,
            customizable: true,
            aiPrompt: 'Identify and reflect on weekly challenges and learnings'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Next Week\'s Focus' },
            position: 5,
            required: true,
            customizable: false
          },
          {
            type: 'todo',
            content: { text: 'Priority task for next week', checked: false },
            position: 6,
            required: false,
            customizable: true,
            aiPrompt: 'Suggest priority tasks for next week based on progress'
          },
          {
            type: 'table',
            content: {
              headers: ['Goal', 'Progress', 'Next Actions'],
              rows: []
            },
            position: 7,
            required: false,
            customizable: true
          }
        ]
      },
      userId: defaultUser.id,
      isPublic: true
    })
    
    // Learning Project Template
    await templateService.createTemplate({
      name: 'Learning Project Template',
      description: 'Structure for learning new skills or subjects',
      category: 'project',
      icon: '📚',
      tags: ['learning', 'education', 'skills'],
      structure: {
        blocks: [
          {
            type: 'heading',
            content: { level: 1, text: 'Learning Project: {{subject}}' },
            position: 0,
            required: true,
            customizable: true,
            aiPrompt: 'Generate learning project title based on subject'
          },
          {
            type: 'text',
            content: { text: 'Learning objectives and outcomes...' },
            position: 1,
            required: true,
            customizable: true,
            aiPrompt: 'Define specific, measurable learning objectives'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Learning Resources' },
            position: 2,
            required: true,
            customizable: false
          },
          {
            type: 'table',
            content: {
              headers: ['Resource', 'Type', 'Status', 'Notes'],
              rows: [
                ['Online Course', 'Course', 'Planned', ''],
                ['Book', 'Book', 'In Progress', '']
              ]
            },
            position: 3,
            required: false,
            customizable: true,
            aiPrompt: 'Suggest learning resources based on the subject'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Learning Schedule' },
            position: 4,
            required: true,
            customizable: false
          },
          {
            type: 'table',
            content: {
              headers: ['Week', 'Topics', 'Activities', 'Assessment'],
              rows: []
            },
            position: 5,
            required: false,
            customizable: true
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Progress Notes' },
            position: 6,
            required: true,
            customizable: false
          },
          {
            type: 'text',
            content: { text: 'Key insights and progress updates...' },
            position: 7,
            required: false,
            customizable: true
          }
        ]
      },
      userId: defaultUser.id,
      isPublic: true
    })
    
    // Get final template count
    const templates = await db.template.findMany({
      where: { userId: defaultUser.id }
    })
    
    console.log(`✅ Created ${templates.length} templates`)
    console.log('📋 Available templates:')
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.category})`)
    })
    
    console.log('\n🎉 Database initialization complete!')
    console.log(`👤 Default user: ${defaultUser.email}`)
    console.log(`📋 Templates: ${templates.length}`)
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run initialization
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { initDatabase }