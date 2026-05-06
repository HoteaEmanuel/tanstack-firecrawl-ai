import * as React from 'react'

import { NavPrimary } from '#/components/nav-primary'
import { NavUser } from '#/components/nav-user'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '#/components/ui/sidebar'
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  BookmarkIcon,
  ImportIcon,
  Compass,
} from 'lucide-react'
import { Link, linkOptions } from '@tanstack/react-router'
import type { NavPrimaryProps, NavUserProps } from '#/lib/types'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: <GalleryVerticalEndIcon />,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: <AudioLinesIcon />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <TerminalIcon />,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: <BotIcon />,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: <BookOpenIcon />,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: <FrameIcon />,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: <PieChartIcon />,
    },
    {
      name: 'Travel',
      url: '#',
      icon: <MapIcon />,
    },
  ],
}

const navItems: NavPrimaryProps['items'] = linkOptions([
  {
    title: 'Items',
    icon: BookmarkIcon,
    to: '/dashboard/items',
    activeOptions: { exact: false },
  },
  {
    title: 'Import',
    icon: ImportIcon,
    to: '/dashboard/import',
    activeOptions: { exact: false },
  },
  {
    title: 'Discover',
    icon: Compass,
    to: '/dashboard/discover',
    activeOptions: { exact: false },
  },
])

export function AppSidebar({ user } : NavUserProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="flex items-center gap-3 p-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-xl">
                  <BookmarkIcon className="size-4" />
                </div>

                <div className="grid flex-1 text-left leading-tight text-sm ">
                  <span className="font-medium">Web scraper with AI</span>
                  <span className="text-xs">Your AI Knowledge Base</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavPrimary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
