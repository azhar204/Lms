import {
  ChartNoAxesColumn,
  Menu,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Sidebaradmin = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems = [
    { to: "dashboard", icon: ChartNoAxesColumn, label: "Instructor" },
    { to: "student", icon: ChartNoAxesColumn, label: "Student" },
    
  ];
  const renderNavLinks = () => (
    <div className="space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => setIsSheetOpen(false)}
        >
          <item.icon size={22} className="text-gray-500 dark:text-gray-400" />
          <span className="text-base font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:block w-[260px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sticky top-0 h-screen shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
        {renderNavLinks()}
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Instructor</h1>
            </div>
            {renderNavLinks()}
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebaradmin;