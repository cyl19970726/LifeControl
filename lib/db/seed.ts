import { db } from './client'
import { TemplateService } from '../services/template-service'

export async function seedDatabase() {
  console.log('Seeding database...')
  
  // Create a default user
  const user = await db.user.upsert({
    where: { email: 'default@example.com' },
    update: {},
    create: {
      email: 'default@example.com',
      name: 'Default User'
    }
  })

  // Create default templates
  const templateService = new TemplateService()
  await templateService.createDefaultTemplates(user.id)

  console.log('Database seeded successfully!')
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding database:', error)
      process.exit(1)
    })
}