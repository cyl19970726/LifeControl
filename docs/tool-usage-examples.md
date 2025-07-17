# Tool Usage Examples for AI Agent

## Creating a Page Block

To create a new page, use the createBlock tool with type 'page':

```json
{
  "type": "page",
  "content": {
    "title": "My Fitness Plan",
    "description": "A comprehensive fitness tracking page",
    "childBlocks": [],
    "layout": "default",
    "visibility": "private",
    "icon": "💪"
  },
  "metadata": {
    "category": "health",
    "tags": ["fitness", "health", "exercise"],
    "aiGenerated": true
  },
  "userId": "default-user"
}
```

## Creating Content Blocks

### Text Block
```json
{
  "type": "text",
  "content": {
    "text": "This is my daily workout routine..."
  },
  "parentId": "<page-block-id>",
  "userId": "default-user"
}
```

### Todo Block
```json
{
  "type": "todo",
  "content": {
    "text": "Complete 30 minutes cardio",
    "checked": false,
    "priority": "high"
  },
  "metadata": {
    "scheduledAt": "2024-01-20T06:00:00Z",
    "category": "fitness"
  },
  "parentId": "<page-block-id>",
  "userId": "default-user"
}
```

### Heading Block
```json
{
  "type": "heading",
  "content": {
    "level": 2,
    "text": "Weekly Goals"
  },
  "parentId": "<page-block-id>",
  "userId": "default-user"
}
```

## Searching Blocks

To find blocks by content:
```json
{
  "query": "fitness goals",
  "userId": "default-user",
  "type": "page",
  "limit": 10
}
```

## Important Notes

1. All date fields should be ISO 8601 strings (e.g., "2024-01-20T10:00:00Z")
2. The `parentId` links blocks to their parent page
3. The `userId` should match the current user
4. Page blocks can contain `childBlocks` array with IDs of child blocks
5. Use `metadata` for additional categorization and scheduling