import {
  Bell,
  Clock,
  Download,
  ExternalLink,
  Gift,
  HelpCircle,
  Keyboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  VolumeX,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toAbsoluteUrl } from '@/shared/lib/helpers';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAuth } from '@/modules/auth/hooks/use-auth';

export function UserDropdownMenu() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <Avatar className="size-7">
          <AvatarImage
            src={toAbsoluteUrl('/media/avatars/300-2.png')}
            alt="@reui"
          />
          <AvatarFallback>CH</AvatarFallback>
          <AvatarIndicator className="-end-2 -top-2">
            <AvatarStatus variant="online" className="size-2.5" />
          </AvatarIndicator>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64"
        side="bottom"
        align="end"
        sideOffset={11}
      >
        {/* User Information Section */}
        <div className="flex items-center gap-3 p-3">
          <Avatar>
            <AvatarImage
              src={toAbsoluteUrl('/media/avatars/300-2.png')}
              alt={user?.email || 'User'}
            />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
            <AvatarIndicator className="-end-1.5 -top-1.5">
              <AvatarStatus variant="online" className="size-2.5" />
            </AvatarIndicator>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.roles?.join(', ') || 'Online'}
            </span>
          </div>
        </div>

        <DropdownMenuItem className="cursor-pointer py-1 rounded-md border border-border hover:bg-muted">
          <Clock />
          <span>Set status</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Bell />
          <span>Notification settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'light' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />


        {/* Action Items */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
