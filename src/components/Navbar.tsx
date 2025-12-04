import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const isAffiliate = user?.role === 'affiliate';

  // Helper to check roles
  const isStudent = user?.role === 'student';
  const isTutor = user?.role === 'tutor';
  const isAdmin = user?.role === 'super_admin';
  
  // Logic: Who sees what?
  // Materials/FAQ: Students, Tutors, Admins (NOT Guests, NOT Affiliates usually)
  const canViewResources = isAuthenticated && (isStudent || isTutor || isAdmin);
  
  // Ticket Inbox: Tutors and Admins only
  const canManageTickets = isAuthenticated && (isTutor || isAdmin);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 border-b border-border backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <img 
              src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" 
              alt="SkillMount" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm">Home</Button>
            </Link>
            <Link to="/students">
              <Button variant={isActive("/students") ? "secondary" : "ghost"} size="sm">Students</Button>
            </Link>
            
            {/* Conditional Links */}
            {canViewResources && (
              <>
                <Link to="/faq">
                  <Button variant={isActive("/faq") ? "secondary" : "ghost"} size="sm">FAQ</Button>
                </Link>
                <Link to="/materials">
                  <Button variant={isActive("/materials") ? "secondary" : "ghost"} size="sm">Materials</Button>
                </Link>
              </>
            )}

            <Link to="/contact">
              <Button variant={isActive("/contact") ? "secondary" : "ghost"} size="sm">Contact</Button>
            </Link>

            {/* Tutor Ticket Inbox */}
            {canManageTickets && (
              <Link to="/tickets/manage">
                <Button variant={isActive("/tickets/manage") ? "secondary" : "ghost"} size="sm" className="text-primary font-medium">
                  {/* <Ticket className="w-4 h-4 mr-2" /> */}
                  Inbox
                </Button>
              </Link>
            )}

            {isAffiliate && (
            <Link to="/affiliate/hub">
              <Button variant={isActive("/affiliate/hub") ? "secondary" : "ghost"} size="sm" className="text-primary font-medium">
                {/* <Sparkles className="w-4 h-4 mr-2" /> */}
                Partner Hub
              </Button>
            </Link>
          )}
          </div>
          
          {/* Desktop Right Side (Auth & Theme) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  {isStudent && (
                    <DropdownMenuItem onClick={() => navigate(`/students/${user?.id}`)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
             <Link to="/login">
              <Button variant="default" size="sm" className="shadow-md">
                Login
              </Button>
            </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-border pt-4 animate-in slide-in-from-top-5">
            <Link to="/" onClick={closeMobileMenu} className="block">
              <Button variant={isActive("/") ? "secondary" : "ghost"} className="w-full justify-start">Home</Button>
            </Link>
            <Link to="/students" onClick={closeMobileMenu} className="block">
              <Button variant={isActive("/students") ? "secondary" : "ghost"} className="w-full justify-start">Students</Button>
            </Link>
            
            {canViewResources && (
              <>
                <Link to="/faq" onClick={closeMobileMenu} className="block">
                  <Button variant={isActive("/faq") ? "secondary" : "ghost"} className="w-full justify-start">FAQ</Button>
                </Link>
                <Link to="/materials" onClick={closeMobileMenu} className="block">
                  <Button variant={isActive("/materials") ? "secondary" : "ghost"} className="w-full justify-start">Materials</Button>
                </Link>
              </>
            )}
            
            <Link to="/contact" onClick={closeMobileMenu} className="block">
              <Button variant={isActive("/contact") ? "secondary" : "ghost"} className="w-full justify-start">Contact</Button>
            </Link>

            {canManageTickets && (
              <Link to="/tickets/manage" onClick={closeMobileMenu} className="block">
                <Button variant="ghost" className="w-full justify-start text-primary">Ticket Inbox</Button>
              </Link>
            )}

            {isAffiliate && (
                <Link to="/affiliate/hub" onClick={closeMobileMenu} className="block">
                  <Button variant="ghost" className="w-full justify-start text-primary">Partner Hub</Button>
                </Link>
              )}

            <div className="border-t border-border my-2 pt-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-sm font-medium">Appearance</span>
                <ThemeToggle />
              </div>
              
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-2 mb-2">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                  </div>
                  {isAdmin && (
                    <Button variant="outline" className="w-full justify-start mb-2" onClick={() => { navigate('/admin'); closeMobileMenu(); }}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                    </Button>
                  )}
                  <Button variant="destructive" className="w-full justify-start" onClick={() => { logout(); closeMobileMenu(); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;