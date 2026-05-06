import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Button, buttonVariants } from '#/components/ui/button'
import { ArrowBigLeft, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen">
      <div className="absolute top-8 left-8">
        <Link
          to={'/'}
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
      </div>
      <div className="flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  )
}
