import { prisma } from '#/db'
import { firecrawl } from '#/lib/firecrawl'
import { bulkSchema, extractSchema, importSchema } from '#/schemas/import'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { authFnMiddleware } from '#/middlewares/auth'
import { notFound } from '@tanstack/react-router'
import { generateText } from 'ai'
import { openrouter } from '@openrouter/ai-sdk-provider'
import { searchSchema } from '#/schemas/auth'
import type { SearchResultWeb } from '@mendable/firecrawl-js'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const { session } = context
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        user_id: session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: extractSchema,
          },
        ],
        location: {
          country: 'US',
          languages: ['en'],
        },
      })

      const jsonData = result.json as z.infer<typeof extractSchema>
      let publishedAt = null
      if (jsonData?.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }
      const updatedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData?.author || null,
          publishedAt: publishedAt,
          status: 'COMPLETED',
        },
      })

      return updatedItem
    } catch (e) {
      const failedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return failedItem
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .inputValidator(bulkSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
      location: {
        country: 'US',
        languages: ['en'],
      },
    })
    return result.links
  })

export type BulkScrapeProgress = {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed'
}

export const bulkScrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ urls: z.array(z.string().url()) }))
  .handler(async function* ({ data, context }) {
    const total = data.urls.length
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]
      const item = await prisma.savedItem.create({
        data: {
          url: url,
          user_id: context.session.user.id,
          status: 'PENDING',
        },
      })

      let status: BulkScrapeProgress['status'] = 'success'

      try {
        const result = await firecrawl.scrape(url, {
          formats: [
            'markdown',
            {
              type: 'json',
              schema: extractSchema,
            },
          ],
          location: {
            country: 'US',
            languages: ['en'],
          },
        })

        console.log('RESULT')
        console.log(result)
        const jsonData = result.json as z.infer<typeof extractSchema>
        let publishedAt = null
        console.log('JSON DATAA')
        console.log(jsonData)
        if (jsonData?.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }
        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData?.author || null,
            publishedAt: publishedAt,
            status: 'COMPLETED',
          },
        })
        console.log('JSON DATA')
        console.log(jsonData)

        // return updatedItem
      } catch (e) {
        const failedItem = await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'FAILED',
          },
        })
        status = 'failed'
        return failedItem
      }
      const progress: BulkScrapeProgress = {
        completed: i + 1,
        total: total,
        url: url,
        status: status,
      }

      yield progress;
    }
  })

export const getItems = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: {
        user_id: context.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return items
  })

export const getItemById = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    console.log('CONTEXT')
    console.log(context?.session)
    const item = await prisma.savedItem.findFirst({
      where: {
        user_id: context?.session.user?.id,
        id: data.id,
      },
    })
    if (!item) throw notFound()
    return item
  })

export const saveSummaryAndGenerateTags = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      itemId: z.string(),
      summary: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { itemId, summary } = data

    console.log('SUMMARY SENT')

    console.log(summary)

    if (!itemId || !data) {
      return new Response('Missing item id or summary', { status: 400 })
    }

    const item = await prisma.savedItem.findUnique({
      where: {
        id: itemId,
        user_id: context.session.user.id,
      },
    })
    if (!item) {
      throw notFound()
    }

    const { text } = await generateText({
      model: openrouter.chat('tencent/hy3-preview:free'),
      system: `You are a helpful assistant that extracts relevant tags from content summaries.
       Extract 3-5 short,relevant tags that categorize content. Return ONLY a comma separated list.
       Example: love, romance, hate`,
      prompt: `Generate tags of this content:\n\n ${summary}`,
    })
    // Extracting the tags, lowercasing them and getting the ones that are not empty, slicing to get only max 5 characters from each one
    const tags = text
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0)
      .slice(0, 5)

    const savedItem = await prisma.savedItem.update({
      where: { id: itemId, user_id: context.session.user.id },
      data: {
        summary: summary,
        tags: tags,
      },
    })
    return savedItem
  })

export const searchWebFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.search(data.query, {
      limit: 15,
      scrapeOptions: { formats: ['markdown'] },
      location: 'Romania',
      tbs: 'qdr:y',
    })
    console.log('RESULT')
    console.log(result)

    return result.web?.map((item) => ({
      url: (item as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      descrition: (item as SearchResultWeb).description,
    })) as SearchResultWeb[]
  })
