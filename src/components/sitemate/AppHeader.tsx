
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Rocket, Settings, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  previewMode: "desktop" | "mobile";
  onPreviewModeChange: (mode: "desktop" | "mobile") => void;
  onDeploy: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  previewMode,
  onPreviewModeChange,
  onDeploy,
}) => {
  return (
    <header className="h-16 bg-card text-card-foreground shadow-md p-3 px-6 flex items-center justify-between border-b">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Preview:</span>
        <Button
          variant={previewMode === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onPreviewModeChange("desktop")}
          aria-pressed={previewMode === "desktop"}
          className="transition-all"
        >
          <Monitor className="mr-2 h-4 w-4" /> Desktop
        </Button>
        <Button
          variant={previewMode === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onPreviewModeChange("mobile")}
          aria-pressed={previewMode === "mobile"}
          className="transition-all"
        >
          <Smartphone className="mr-2 h-4 w-4" /> Mobile
        </Button>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" className="transition-all">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
         <Button variant="outline" size="sm" className="transition-all relative">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={onDeploy} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all">
          <Rocket className="mr-2 h-4 w-4" /> Deploy Site
        </Button>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person portrait" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">SiteMate User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;

