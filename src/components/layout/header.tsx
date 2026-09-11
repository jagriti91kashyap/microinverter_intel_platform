'use client';

import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  LogOut, 
  User,
  Bell
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-12 items-center justify-between px-6">
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-gray-50 transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-enphase-500 rounded-full" />
          </button>

          {/* User Menu */}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                  <AvatarFallback className="bg-enphase-100 text-enphase-700 font-medium text-xs">
                    {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] font-medium text-gray-700 hidden sm:inline">{session.user?.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 border border-gray-200 bg-white shadow-lg rounded-lg" align="end">
                <div className="px-3 py-2.5">
                  {session.user?.name && <p className="font-medium text-[13px] text-gray-900">{session.user?.name}</p>}
                  <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer text-[13px]">
                  <User className="mr-2 h-3.5 w-3.5" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer text-[13px]">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 text-[13px]">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
