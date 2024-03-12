import { Menu, School } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const location = useLocation();

  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Logged out successfully.", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });

      navigate("/login");
    }
  }, [isSuccess]);

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="h-16 dark:bg-[#0A1638] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 z-10  ">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center h-full px-4">
        <div className="flex items-center gap-3">
          <School size={28} />
          <Link to="/">
            <h1 className="font-extrabold text-2xl hover:text-blue-600 transition ml-4">
              Digital Learning
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user?.photoUrl} alt="User" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="/my-learning" className="w-full">
                      My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {(user?.role === "instructor" || user?.role === "admin") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link
                        to={
                          user?.role === "instructor"
                            ? "/admin/dashboard"
                            : "/adminstrator/dashboard"
                        }
                        className="w-full"
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                className={
                  location.pathname === "/login"
                    ? "bg-blue-700 text-white hover:bg-blue-700 hover:text-white"
                    : "bg-white text-black hover:bg-white hover:text-black"
                }
                onClick={() => navigate("/login")}
              >
                Login
              </Button>{" "}
              <Button
                variant="active"
                className={
                  location.pathname === "/signup " ||
                  location.pathname != "/login"
                    ? "bg-blue-700 text-white hover:bg-blue-700 hover:text-white"
                    : "bg-white text-black hover:bg-white hover:text-black"
                }
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}

          <DarkMode />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <div className="flex items-center">
          <School size={28} />
          <Link to="/">
            <h1 className="font-extrabold text-2xl hover:text-blue-600 transition ml-4">
              Smart Learning
            </h1>
          </Link>
        </div>
        <MobileNavbar user={user} logoutHandler={logoutHandler} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full hover:bg-gray-200"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle>
            <Link to="/">Digital Learning</Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>

        <Separator className="my-4" />

        {user ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Avatar>
                <AvatarImage src={user?.photoUrl} alt="User" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || "User"}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-4">
              <SheetClose asChild>
                <Link to="/my-learning">My Learning</Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile">Edit Profile</Link>
              </SheetClose>
              <Button
                variant="ghost"
                onClick={logoutHandler}
                className="justify-center bg-gray-50 dark:bg-gray-500 hover:dark:bg-gray-800  font-extrabold"
              >
                Log Out
              </Button>
            </nav>

            {(user?.role === "instructor" || user?.role === "admin") && (
              <SheetFooter className="mt-auto">
                <SheetClose asChild>
                  <Button
                    onClick={() =>
                      navigate(
                        user?.role === "instructor"
                          ? "/admin/dashboard"
                          : "/adminstrator/dashboard",
                      )
                    }
                  >
                    Dashboard
                  </Button>
                </SheetClose>
              </SheetFooter>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-4 mt-6">
            <Button
              className={
                location.pathname === "/login"
                  ? "bg-blue-700 text-white hover:bg-blue-700 hover:text-white"
                  : "bg-white text-black hover:bg-white hover:text-black"
              }
              onClick={() => navigate("/login")}
            >
              Login
            </Button>{" "}
            <Button
              variant="active"
              className={
                location.pathname === "/signup " ||
                location.pathname != "/login"
                  ? "bg-blue-700 text-white hover:bg-blue-700 hover:text-white"
                  : "bg-white text-black hover:bg-white hover:text-black"
              }
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
