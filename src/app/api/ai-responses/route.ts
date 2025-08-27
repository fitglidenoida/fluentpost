import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { z } from 'zod'

const aiResponseSchema = z.object({
  promptId: z.string(),
  promptType: z.string(),
  promptData: z.string(),
  response: z.string(),
  content: z.string().optional(),
  status: z.string().default('pending'),
})

// Helper function to clean content
function cleanContent(content: string): string {
  return content
    .replace(/\\n\\n/g, '\n\n') // Replace escaped newlines with actual newlines
    .replace(/\\n/g, '\n') // Replace single escaped newlines
    .replace(/\\"/g, '"') // Replace escaped quotes
    .replace(/\\'/g, "'") // Replace escaped single quotes
    .trim()
}

export async function GET() {
  try {
    const aiResponses = await prisma.aIResponse.findMany({
      where: {
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ aiResponses })
  } catch (error: any) {
    console.error('Error fetching AI responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI responses' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = aiResponseSchema.parse(body)

    // Clean the content if provided
    let cleanedContent = validatedData.content
    if (validatedData.response) {
      try {
        const parsedResponse = JSON.parse(validatedData.response)
        if (parsedResponse.content) {
          cleanedContent = cleanContent(parsedResponse.content)
        }
      } catch (error) {
        console.warn('Could not parse response JSON for cleaning')
      }
    }

    const aiResponse = await prisma.aIResponse.create({
      data: {
        ...validatedData,
        content: cleanedContent || '',
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
      },
    })

    return NextResponse.json(aiResponse, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating AI response:', error)
    return NextResponse.json(
      { error: 'Failed to create AI response' },
      { status: 500 }
    )
  }
}

// Helper function to store GPT response
export async function storeGPTResponse(promptId: string, gptResponse: string, promptType: string, promptData: string) {
  try {
    const cleanedContent = cleanContent(gptResponse)
    
    const aiResponse = await prisma.aIResponse.create({
      data: {
        promptId,
        promptType,
        promptData,
        response: gptResponse,
        content: cleanedContent,
        status: 'processed',
        userId: 'cmerb0ul10000v37n3jqqjoq4', // Super Admin user ID
      },
    })

    return aiResponse
  } catch (error: any) {
    console.error('Error storing GPT response:', error)
    throw error
  }
}
