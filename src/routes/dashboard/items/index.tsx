import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getItems } from '#/data/items'
import { ItemsStatus } from '#/generated/prisma/enums'
import { copyToClipboard } from '#/lib/clipboard'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Check, Copy, Inbox } from 'lucide-react'
import { Suspense, use, useEffect, useState } from 'react'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Skeleton } from '#/components/ui/skeleton'

type Item = {
  id: string
  content: string | null
  title: string | null
  createdAt: Date
  updatedAt: Date
  url: string
  summary: string | null
  tags: string[]
  author: string | null
  publishedAt: Date | null
  ogImage: string | null
  status: ItemsStatus
  user_id: string
}

const itemsSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemsStatus)]).default('all'),
})

function ItemsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden pt-0">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>

            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

type InputSearch = z.infer<typeof itemsSchema>

function ItemList({
  q,
  status,
  data,
}: {
  q: InputSearch['q']
  status: InputSearch['status']
  data: ReturnType<typeof getItems>
}) {
  const [copied, setCopied] = useState<string>('')
  const handleCopy = async (item: Item) => {
    await copyToClipboard(item.url)
    setCopied(item.id)

    setTimeout(() => {
      setCopied('')
    }, 2000)
  }
  const items = use(data)
  const filteredItems = items.filter((item) => {
    const search = q.toLowerCase()
    const matchesQuery =
      q === ' ' ||
      item.title?.toLowerCase().includes(search) ||
      item.tags.some((tag) => tag.toLowerCase().includes(search))

    const matchesStatus =
      status === 'all' || item.status.toLowerCase() === status.toLowerCase()

    return matchesQuery && matchesStatus
  })

  if (filteredItems.length === 0)
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant={'icon'}>
            <Inbox className="size-12" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length == 0 ? 'No items saved yet' : 'No items found'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length == 0
              ? 'Import a URL to get started with saving our content'
              : 'No items match your search'}
          </EmptyDescription>
        </EmptyHeader>

        {items.length === 0 && (
          <EmptyContent>
            <Link to="/dashboard/import">Import URL</Link>
          </EmptyContent>
        )}
      </Empty>
    )

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {filteredItems.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{
              itemId: item.id,
            }}
            className="block"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={
                  item.ogImage ??
                  'https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
                alt={item.title ?? 'image title'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {item.status.toLowerCase()}
                </Badge>
                <Button
                  variant={'outline'}
                  size={'icon'}
                  className="size-8"
                  onClick={() => handleCopy(item)}
                >
                  {copied == item.id ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>

              <CardTitle className="truncate text-lg leading-snug group-hover:text-primary transition-colors">
                {' '}
                {item.title}
              </CardTitle>

              {item.author && (
                <p className="text-xs text-muted-foreground">{item.author}</p>
              )}

              {item?.summary && (
                <CardDescription className="line-clamp-3">
                  {item.summary}
                </CardDescription>
              )}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge className="text-[10px]" variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({ itemsPromise: getItems() }),
  validateSearch: zodValidator(itemsSchema),
  head: () => ({
    meta: [
      {
        title: 'Saved Items',
      },
    ],
  }),
})

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()

  const { q, status } = Route.useSearch()
  const navigate = useNavigate({
    from: Route.fullPath,
  })

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    if (searchInput === q) return
    const timeOutId = setTimeout(() => {
      navigate({
        search: (prev) => ({
          ...prev,
          q: searchInput,
        }),
      })
    }, 500)

    return () => clearTimeout(timeOutId)
  }, [searchInput, navigate, q])
  // Filtering the items based on the search and status

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Saved items</h1>
        <p className="text-muted-foreground">
          Your saved articles and content!
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search items by title or tags"
          className="p-4"
        />
        <div>
          <Select
            value={status}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  status: value as typeof status,
                }),
              })
            }
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {Object.values(ItemsStatus).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* The items list is suspended  */}
      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemList data={itemsPromise} status={status} q={q} />
      </Suspense>
    </div>
  )
}
