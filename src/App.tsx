import { Bell, Check, ChevronRight, Home, Settings, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Component Showcase
          </h1>
          <p className="text-muted-foreground mt-1">
            Demonstrating the integrated React component bundle with Tailwind CSS v4.
          </p>
        </div>

        <Separator />

        {/* Button Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Button Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        <Separator />

        {/* Button Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Settings">
              <Settings />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Buttons with Icons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Check />
              Confirm
            </Button>
            <Button variant="outline">
              <Bell />
              Notifications
            </Button>
            <Button variant="secondary">
              <Star />
              Favourite
            </Button>
            <Button variant="destructive">
              <Trash2 />
              Delete
            </Button>
            <Button variant="ghost">
              <Home />
              Home
            </Button>
            <Button variant="link">
              Learn more
              <ChevronRight />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Disabled State */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Disabled State</h2>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Default</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="ghost" disabled>Ghost</Button>
          </div>
        </section>

        <Separator />

        {/* Separator Orientations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Separator</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Horizontal</p>
            <Separator orientation="horizontal" />
          </div>
          <div className="flex h-10 items-center gap-4">
            <span className="text-sm text-foreground">Section A</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-foreground">Section B</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-foreground">Section C</span>
          </div>
        </section>

      </div>
    </div>
  )
}

export default App
