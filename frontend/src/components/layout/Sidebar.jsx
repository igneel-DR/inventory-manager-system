import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Building2, 
  ShoppingCart, 
  BarChart3, 
  X, 
  Tags,
  UserCircle,
  ClipboardList,
  MessageSquareText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Check for saved preference in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setIsExpanded(savedState === 'true');
    }
  }, []);
  
  // Save preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', isExpanded);
  }, [isExpanded]);
  
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  if (!user) return null;

  // Original sidebar items
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ['admin', 'stock_manager', 'accountant']
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Stock Movements",
      href: "/stock-movements",
      icon: ShoppingCart,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Categories",
      href: "/categories",
      icon: Tags,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Suppliers",
      href: "/suppliers",
      icon: Building2,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ['admin', 'accountant']
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      roles: ['admin']
    },
    {
      title: "AI Assistant",
      href: "/chat",
      icon: MessageSquareText,
      roles: ['admin', 'stock_manager', 'accountant']
    },
  ];

  // Filter based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role.toLowerCase()));
  
  // Simply use the filtered items as the sidebar items
  let sidebarItems = [...filteredNavItems];
  
  // Add audit logs only for admins
  if (user?.role.toLowerCase() === 'admin') {
    sidebarItems.push({
      title: "Audit Logs",
      href: "/audit-logs",
      icon: ClipboardList,
      roles: ['admin']
    });
  }

  return (
    <div className={cn(
      "flex h-full flex-col overflow-auto border-r bg-background transition-all duration-300 ease-in-out",
      isExpanded ? "w-60" : "w-16"
    )}>
      <div className={cn(
        "flex h-16 items-center px-4",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        {isExpanded ? (
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-lg">O.T.R.A</span>
            <span className="text-xs text-muted-foreground">Food Distribution</span>
          </Link>
        ) : (
          <Link to="/dashboard" className="flex items-center justify-center">
            <span className="font-semibold text-lg">O</span>
          </Link>
        )}
        <div className="flex items-center">
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("hidden md:flex transition-transform", !isExpanded && "rotate-180")}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        <TooltipProvider delayDuration={300}>
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return isExpanded ? (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => onClose && window.innerWidth < 768 ? onClose() : null}
                className={cn(
                  "group flex items-center rounded-md text-sm font-medium transition-colors px-3 py-2.5",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 shrink-0 mr-3",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                <span className="transition-opacity duration-300">{item.title}</span>
              </Link>
            ) : (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    onClick={() => onClose && window.innerWidth < 768 ? onClose() : null}
                    className={cn(
                      "group flex items-center rounded-md text-sm font-medium transition-colors py-2.5 justify-center",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "h-5 w-5 shrink-0 mx-auto",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} 
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
      
      <div className="mt-auto border-t p-4">
        <TooltipProvider delayDuration={300}>
          {isExpanded ? (
            <Button 
              variant="outline" 
              className="w-full justify-start transition-all duration-300" 
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="h-5 w-5 text-muted-foreground mr-3" />
              <span>Logout</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-center px-0 transition-all duration-300" 
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <LogOut className="h-5 w-5 text-muted-foreground mx-auto" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Logout
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}

// Need to import useNavigate from react-router-dom for the handleLogout function
// import { useNavigate } from "react-router-dom"; // This is redundant 