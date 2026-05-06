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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Progress } from '#/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  bulkScrapeUrlFn,
  mapUrlFn,
  scrapeUrlFn,
  type BulkScrapeProgress,
} from '#/data/items'
import { bulkSchema, importSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, LinkIcon, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [bulkPending, bulkingTransition] = useTransition()
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const [discoveredLinks, setDiscoveredLinks] = useState<
    Array<SearchResultWeb>
  >([])

  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())

  const handleSelectAll = () => {
    if (selectedUrls.size == discoveredLinks.length) setSelectedUrls(new Set())
    else setSelectedUrls(new Set(discoveredLinks.map((item) => item.url)))
  }

  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(url)) newSelected.delete(url)
    else newSelected.add(url)
    setSelectedUrls(newSelected)
  }

  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        console.log(value)
        await scrapeUrlFn({ data: value })

        toast.success('Import was successfull')
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: bulkSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        const data = await mapUrlFn({ data: value })
        setDiscoveredLinks(data)
      })
    },
  })

  const scrapeUrls = () => {
    if (selectedUrls.size === 0) {
      toast.error('Please select at least one URL')
      return
    }
    bulkingTransition(async () => {
      setProgress({
        total: selectedUrls.size,
        completed: 0,
        url: '',
        status: 'success',
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

  console.log(selectedUrls)
  return (
    <div className="w-full flex flex-1 justify-center items-center py-8">
      <div className="w-full max-w-2xl space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold ">Import content</h1>
          <p className="text-muted-foreground pt-2">
            Save web pages to your library
          </p>
        </div>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single url
            </TabsTrigger>

            <TabsTrigger value="bulk" className="gap-2">
              <Globe className="size-4" />
              Bulk import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import single URL</CardTitle>
                <CardDescription>
                  Scrape and save content from any web app!
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    console.log(e.target.value)
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <form.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Enter url"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

                    <Button>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          processing...
                        </>
                      ) : (
                        <span>Import url</span>
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk import</CardTitle>
                <CardDescription>
                  Discover and import multiple URLs from a website at once
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    console.log(e.target.value)
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Enter url"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Filter</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="e.g Blogs"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />

                    <Button>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          processing...
                        </>
                      ) : (
                        <span>Import urls</span>
                      )}
                    </Button>
                  </FieldGroup>
                </form>

                {discoveredLinks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Found {discoveredLinks.length} URLs
                      </p>
                      {/* {discoveredLinks.map((item) => (
                        <li key={item.url}>
                          <p>{item.url}</p>
                        </li>
                      ))} */}
                      <Button
                        variant="outline"
                        size={'sm'}
                        onClick={handleSelectAll}
                      >
                        {selectedUrls.size === discoveredLinks.length
                          ? 'Delete all'
                          : 'Select all'}
                      </Button>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4 flex flex-col gap-1 items-start">
                      {discoveredLinks.map((item) => (
                        <label
                          key={item.url}
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
                            {Math.round(progress.completed / progress.total) *
                              100}
                          </span>
                        </div>
                        <Progress
                          value={(progress.completed / progress.total) * 100}
                        />
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => scrapeUrls()}
                      disabled={bulkPending}
                    >
                      {' '}
                      {!bulkPending ? (
                        `Import ${selectedUrls.size} urls`
                      ) : (
                        <>
                          <Loader2 className="animate-spin size-4" />
                          {progress
                            ? `Importing ${progress.completed}/${progress.total}...`
                            : 'Starting...'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
