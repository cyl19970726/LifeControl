"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLifeAgentStore } from "@/lib/store"
import { BookOpen, Plus, Calendar, Tag, Edit, Trash2 } from "lucide-react"

export default function ReviewsPage() {
  const { reviews, projects, addReview, updateReview, deleteReview } = useLifeAgentStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: "daily" as "daily" | "weekly" | "monthly",
    content: "",
    tags: "",
    linkedProjectIds: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const reviewData = {
      type: formData.type,
      entries: [
        {
          content: formData.content,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
          linkedProjectIds: formData.linkedProjectIds,
        },
      ],
    }

    if (editingReview) {
      updateReview(editingReview, reviewData)
      setEditingReview(null)
    } else {
      addReview(reviewData)
    }

    setFormData({ type: "daily", content: "", tags: "", linkedProjectIds: [] })
    setIsDialogOpen(false)
  }

  const handleEdit = (review: any) => {
    const entry = review.entries[0] || {}
    setFormData({
      type: review.type,
      content: entry.content || "",
      tags: entry.tags?.join(", ") || "",
      linkedProjectIds: entry.linkedProjectIds || [],
    })
    setEditingReview(review.id)
    setIsDialogOpen(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-green-100 text-green-800"
      case "weekly":
        return "bg-blue-100 text-blue-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterReviewsByType = (type: string) => {
    return reviews.filter((review) => review.type === type)
  }

  const getLinkedProjects = (projectIds: string[] = []) => {
    return projects.filter((p) => projectIds.includes(p.id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              Reviews & Reflections
            </h1>
            <p className="text-slate-600">Document your journey, insights, and learnings for continuous growth</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingReview ? "Edit Review" : "Create New Review"}</DialogTitle>
                <DialogDescription>Reflect on your progress, challenges, and insights.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Review Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Reflection Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="What went well? What challenges did you face? What did you learn?"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                  <Textarea
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="progress, challenge, insight, learning..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Linked Projects</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {projects.map((project) => (
                      <label key={project.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.linkedProjectIds.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, linkedProjectIds: [...formData.linkedProjectIds, project.id] })
                            } else {
                              setFormData({
                                ...formData,
                                linkedProjectIds: formData.linkedProjectIds.filter((p) => p !== project.id),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{project.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingReview ? "Update Review" : "Create Review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingReview(null)
                      setFormData({ type: "daily", content: "", tags: "", linkedProjectIds: [] })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ReviewsList
              reviews={reviews}
              onEdit={handleEdit}
              onDelete={deleteReview}
              getLinkedProjects={getLinkedProjects}
              getTypeColor={getTypeColor}
            />
          </TabsContent>

          <TabsContent value="daily" className="mt-6">
            <ReviewsList
              reviews={filterReviewsByType("daily")}
              onEdit={handleEdit}
              onDelete={deleteReview}
              getLinkedProjects={getLinkedProjects}
              getTypeColor={getTypeColor}
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <ReviewsList
              reviews={filterReviewsByType("weekly")}
              onEdit={handleEdit}
              onDelete={deleteReview}
              getLinkedProjects={getLinkedProjects}
              getTypeColor={getTypeColor}
            />
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <ReviewsList
              reviews={filterReviewsByType("monthly")}
              onEdit={handleEdit}
              onDelete={deleteReview}
              getLinkedProjects={getLinkedProjects}
              getTypeColor={getTypeColor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ReviewsList({
  reviews,
  onEdit,
  onDelete,
  getLinkedProjects,
  getTypeColor,
}: {
  reviews: any[]
  onEdit: (review: any) => void
  onDelete: (id: string) => void
  getLinkedProjects: (projectIds: string[]) => any[]
  getTypeColor: (type: string) => string
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-600 mb-2">No Reviews Yet</h3>
        <p className="text-slate-500">Start documenting your reflections and insights</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(review.type)}>{review.type}</Badge>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(review)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(review.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {review.entries.map((entry: any, idx: number) => (
              <div key={idx} className="mb-4">
                <p className="text-slate-700 mb-3 leading-relaxed">{entry.content}</p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.tags.map((tag: string, tagIdx: number) => (
                      <Badge key={tagIdx} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {entry.linkedProjectIds && entry.linkedProjectIds.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Related Projects</h4>
                    <div className="space-y-1">
                      {getLinkedProjects(entry.linkedProjectIds).map((project: any) => (
                        <div key={project.id} className="text-xs text-slate-600 bg-slate-50 p-1 rounded">
                          {project.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
