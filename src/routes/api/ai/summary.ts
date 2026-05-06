import { prisma } from '#/db'
import { openrouter } from '@openrouter/ai-sdk-provider'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const { itemId, prompt } = await request.json()

        if (!itemId || !prompt)
          return new Response('Missing prompt or item id', { status: 400 })

        const item = await prisma.savedItem.findUnique({
          where: {
            id: itemId,
            user_id: context?.session.user.id,
          },
        })

        if (!item) {
          return new Response('Item not found', { status: 404 })
        }

        const result = streamText({
          model: openrouter.chat('tencent/hy3-preview:free'),
          system: `You are a helpful assistant that creates concise, informative summaries of web content. Your summaries should:
                    - Be 2-3 parahraphs long
                    - Capture the main points and key takeaways
                    - Be written in a clear, professional tone`,
          prompt: `Please summaries the following content:\n\n ${prompt}`,
        })
        // Return the stream in the format useCompletion expectes
        return result.toTextStreamResponse()
      },
    },
  },
})
