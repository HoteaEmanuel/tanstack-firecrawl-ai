import { Navigate, useNavigate, Link } from '@tanstack/react-router'
import ThemeToggle from '../ThemeToggle'
import { Button, buttonVariants } from '../ui/button'
import { authClient } from '#/lib/auth-client'
import { LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'

export const NavBar = () => {
  const navigate = useNavigate()
  const { data, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions:{
        onSuccess:()=>{
          toast.success('Log out successfully!')
        },
        onError:()=>{
          toast.error("Log out failed");
        }
      }
    })
  }
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="https://imgs.search.brave.com/2JaTWtxBCaDh0sqDVbXJaAN9s1jdhM3tBHhrrrfYhvw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90YW5z/dGFjay5kZXYvX2J1/aWxkL2Fzc2V0cy9z/cGxhc2gtZGFyay04/bndsYzBOdC5wbmc"
            alt="Tanstack Logo"
            className="size-8 hover:scale-110"
          />
          <h1 className="font-bold text-2xl">Tanstack Start</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isPending ? null : data?.session ? (
            <>
              <Button variant={'secondary'} onClick={handleSignOut}>
                Log out
                <LogOutIcon />
              </Button>
              <Link to="/dashboard" className={buttonVariants()}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              {' '}
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={buttonVariants({ variant: 'default' })}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
