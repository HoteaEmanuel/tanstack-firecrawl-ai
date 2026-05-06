import { Button, buttonVariants } from '#/components/ui/button'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { getItemById, saveSummaryAndGenerateTags } from '#/data/items'
import { Badge } from '#/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { useState } from 'react'
import { MessageResponse } from '#/components/ai-elements/message'
import { useCompletion } from '@ai-sdk/react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemById({ data: { id: params.itemId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title ?? 'Item details',
      },
      {
        property: 'og:image',
        content: loaderData?.ogImage ?? 'Default image',
      },
      {
        name: 'twitter:title',
        content: loaderData?.title ?? 'Item details',
      },
    ],
  }),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const router = useRouter()

  console.log('ITEM ')
  console.log(data)
  const { completion, isLoading, complete } = useCompletion({
    api: '/api/ai/summary',
    streamProtocol: 'text',
    body: {
      itemId: data.id,
    },
    onFinish: async (_prompt, completionText) => {
      await saveSummaryAndGenerateTags({
        data: { itemId: data.id, summary: completionText },
      })
      toast.success('Summary generated and saved')
      router.invalidate()
    },

    onError: (e) => {
      toast.error(e.message)
    },
  })

  function handleGenerateSummary() {
    console.log('GENERATING')
    if (!data.content) {
      toast.error('No content available to summarize')
      return
    }

    complete(data.content)
  }
  const [contentOpen, setContentOpen] = useState(false)
  console.log('CONTENT OPEN')
  console.log(contentOpen)
  return (
    <div className="mx-auto max-w-3xl space-y-6 w-full">
      <div className="flex justify-start">
        <Link
          to="/dashboard/items"
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          <ArrowLeft />
        </Link>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <img
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          src={
            data.ogImage ??
            'https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }
          alt={data.title ?? 'Title'}
        />
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {data.title ?? 'Untitled'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {data.author && (
            <span className="inline-flex items-center gap-1">
              <User className="size-4" />
              {data.author}
            </span>
          )}

          {data.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-4" />
              {new Date(data.publishedAt).toLocaleDateString('en-US')}
            </span>
          )}

          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" />
            Saved {new Date(data.updatedAt).toLocaleDateString('en-US')}
          </span>
        </div>
        <a
          href={data.url}
          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
          target="_blank"
        >
          View original
          <ExternalLink className="size-4" />
        </a>

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge>{tag}</Badge>
            ))}
          </div>
        )}
        {/* Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                  Summary{' '}
                </h2>

                {completion || data.summary ? (
                  <MessageResponse>
                    {data.summary || completion}
                  </MessageResponse>
                ) : (
                  <p className="text-muted-foreground italic">
                    {data.content
                      ? 'No summary yet. Generate one using ai'
                      : 'No content available'}
                  </p>
                )}
              </div>

              {data.content && !data.summary && (
                <Button
                  disabled={isLoading}
                  className="cursor-pointer"
                  size={'sm'}
                  onClick={handleGenerateSummary}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Generating
                      summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Generate summary
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {data?.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="font-medium">Full Content</span>

                <ChevronDown
                  className={cn(
                    contentOpen ? 'rotate-180' : '',
                    'size-4 transition-transform duration-200 ',
                  )}
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <MessageResponse>{data.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
