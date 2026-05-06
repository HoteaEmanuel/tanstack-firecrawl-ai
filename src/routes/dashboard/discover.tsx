import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  FieldError,
  FieldGroup,
  FieldLabel,
  Field,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Progress } from '#/components/ui/progress'
import { bulkScrapeUrlFn, searchWebFn } from '#/data/items'
import type { BulkScrapeProgress } from '#/data/items'
import { searchSchema } from '#/schemas/auth'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/discover')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()

  const [isBulking, bulkingTransition] = useTransition()
  const [searchResult, setSearchResult] = useState<Array<SearchResultWeb>>([])

  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(url)) newSelected.delete(url)
    else newSelected.add(url)
    setSelectedUrls(newSelected)
  }

  const handleSelectAll = () => {
    console.log(searchResult.length, selectedUrls.size)
    if (selectedUrls.size == searchResult.length - 1) setSelectedUrls(new Set())
    else setSelectedUrls(new Set(searchResult.map((item) => item.url)))
  }

  const scrapeUrls = () => {
    if (selectedUrls.size === 0) {
      toast.error('Please select at least one URL')
      return
    }
    bulkingTransition(async () => {
      setProgress({
        completed: 0,
        total: selectedUrls.size,
        status: 'success',
        url: '',
      })

      let succesCnt = 0
      let failedCnt = 0
      for await (const update of await bulkScrapeUrlFn({
        data: { urls: Array.from(selectedUrls) },
      })) {
        setProgress(update)

        if (update.status === 'success') succesCnt++
        else failedCnt++
      }

      setProgress(null)

      if (failedCnt) {
        toast.success(`Imported ${succesCnt} URLs ( ${failedCnt} failed)`)
      } else toast.success(`Successfully imported ${succesCnt} URLs`)

      toast.success(`Succesfully scraped ${selectedUrls.size} urls`)
    })
  }

  const form = useForm({
    defaultValues: {
      query: ' ',
    },
    validators: {
      onSubmit: searchSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await searchWebFn({ data: { query: value.query } })
        setSearchResult(result)
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            Search the web for articles on any topic.
          </p>
        </div>
        <Card className="py-6 px-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Topic Search
            </CardTitle>
            <CardDescription>
              Search the web for content and import what you like
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="query"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Query</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. React components"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Search
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            {searchResult.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Found {searchResult.length} URLs
                  </p>
                  <Button
                    variant="outline"
                    size={'sm'}
                    onClick={handleSelectAll}
                  >
                    {selectedUrls.size + 1 === searchResult.length
                      ? 'Delete all'
                      : 'Select all'}
                  </Button>
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4 flex flex-col gap-1 items-start">
                  {searchResult.map((item, index) => (
                    <label
                      key={item.url + index}
                      className="hover:bg-muted/50 flex cursor-pointer gap-2 items-center"
                    >
                      <Checkbox
                        className="mt-1"
                        onCheckedChange={() => handleToggleUrl(item.url)}
                        checked={selectedUrls.has(item.url)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item?.title ?? (
                            <span className="italic">Title not found</span>
                          )}
                        </p>
                        {item?.description && (
                          <p className="text-muted-foreground truncate text-xs">
                            {item?.description ?? (
                              <span className="italic">
                                Description not found
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-muted-foreground truncate text-xs">
                          {item.url}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Importing {progress.completed} {progress.total} URL
                      </span>
                      <span className="font-medium">
                        {Math.round(progress.completed / progress.total) * 100}
                      </span>
                    </div>
                    <Progress
                      value={(progress.completed / progress.total) * 100}
                    />
                  </div>
                )}
                {selectedUrls.size && (
                  <Button
                    className="w-full"
                    onClick={() => scrapeUrls()}
                    disabled={isBulking}
                  >
                    {' '}
                    {!isBulking ? (
                      `Import ${selectedUrls.size} urls`
                    ) : (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        {progress
                          ? `Importing ${progress.completed}/${progress.total}...`
                          : 'Starting...'}
                        {/* <span>{`Imported ${progress?.completed} URL out of ${progress?.total}`}</span> */}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
