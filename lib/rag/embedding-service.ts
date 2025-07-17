import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

export class EmbeddingService {
  private model = openai.embedding('text-embedding-3-small')

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Clean and prepare text
      const cleanedText = this.preprocessText(text)
      
      if (cleanedText.length === 0) {
        // Return zero vector for empty text
        return new Array(1536).fill(0)
      }
      
      // Generate embedding using OpenAI
      const { embedding } = await embed({
        model: this.model,
        value: cleanedText
      })
      
      return embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Return zero vector on error
      return new Array(1536).fill(0)
    }
  }

  async generateMultipleEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const cleanedTexts = texts.map(text => this.preprocessText(text))
      
      // Filter out empty texts
      const validTexts = cleanedTexts.filter(text => text.length > 0)
      
      if (validTexts.length === 0) {
        return texts.map(() => new Array(1536).fill(0))
      }
      
      // Generate embeddings in batch
      const embeddings = await Promise.all(
        validTexts.map(text => this.generateEmbedding(text))
      )
      
      return embeddings
    } catch (error) {
      console.error('Error generating multiple embeddings:', error)
      // Return zero vectors on error
      return texts.map(() => new Array(1536).fill(0))
    }
  }

  private preprocessText(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }
    
    // Remove extra whitespace and normalize
    const cleaned = text
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
    
    // Truncate if too long (OpenAI has token limits)
    const maxLength = 8000 // Conservative limit
    if (cleaned.length > maxLength) {
      return cleaned.substring(0, maxLength)
    }
    
    return cleaned
  }

  async calculateSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length')
    }
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }
    
    if (norm1 === 0 || norm2 === 0) {
      return 0
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }
}