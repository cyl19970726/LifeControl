import { ProjectRepository } from "./project-repository"
import { GoalRepository } from "./goal-repository"
import { ReviewRepository } from "./review-repository"

// 创建仓库实例
export const projectRepository = new ProjectRepository()
export const goalRepository = new GoalRepository()
export const reviewRepository = new ReviewRepository()

// 导出类型
export type { ProjectWithRelations } from "./project-repository"
export type { GoalWithRelations } from "./goal-repository"
export type { ReviewWithRelations } from "./review-repository"
