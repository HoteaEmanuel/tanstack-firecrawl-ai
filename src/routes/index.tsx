import { NavBar } from '#/components/web/navbar'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <NavBar />
    </div>
  )
}
