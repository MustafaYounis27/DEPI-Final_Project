import React, { useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { Input } from './ui/Input';

interface TopbarProps {
  title: string;
  userName: string;
  userRole: string;
}

export function Topbar({ title, userName, userRole }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  return (
    <header className="h-[88px] flex items-center justify-between px-8 mb-4 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your schedule for today</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-80">
          <Input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            placeholder="Search patient ID or record..." 
            leftIcon={<Search size={16} />}
            rightIcon={searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : undefined}
            className="bg-white"
          />
          
          {/* Fake Search Results Dropdown */}
          {isSearching && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 text-sm text-slate-500 text-center">
                Searching for <span className="font-medium text-slate-900">"{searchQuery}"</span>...
                <br />
                <span className="text-xs mt-1 block">No results found in current context.</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-slate-900">{userName}</div>
              <div className="text-xs text-slate-500">{userRole}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}`} alt={userName} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
