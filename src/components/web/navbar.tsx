export const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-amber-50 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="https://imgs.search.brave.com/2JaTWtxBCaDh0sqDVbXJaAN9s1jdhM3tBHhrrrfYhvw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90YW5z/dGFjay5kZXYvX2J1/aWxkL2Fzc2V0cy9z/cGxhc2gtZGFyay04/bndsYzBOdC5wbmc"
            alt="Tanstack Logo"
            className="size-8"
          />
          <h1 className="font-bold text-2xl">Tanstack Start</h1>
        </div>
      </div>
    </nav>
  )
}
