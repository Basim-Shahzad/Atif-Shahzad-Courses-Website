import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import LoginDropdown from "../Components/AuthComponents/LoginDropdown";
import SignupDropdown from "../Components/AuthComponents/SignupDropdown";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { IoReorderThreeOutline } from "react-icons/io5";
import { Button } from "primereact/button";
import { IoCloseSharp } from "react-icons/io5";

const Navbar = () => {
   const { user, logout, initializing, authLoading } = useAuth();

   const [showLoginDropdown, setShowLoginDropdown] = useState(false);
   const [showSignupDropdown, setShowSignupDropdown] = useState(false);
   const [showSidebar, SetshowSidebar] = useState(false);
   const [visible, setVisible] = useState(false);
   const loginBtnRef = useRef(null);
   const signupBtnRef = useRef(null);
   const loginDropdownRef = useRef(null);
   const signupDropdownRef = useRef(null);

   const toggleLogin = () => {
      setShowLoginDropdown((prev) => !prev);
      setShowSignupDropdown(false);
   };

   const showSignupFromLogin = () => {
      setShowLoginDropdown(false);
      setShowSignupDropdown(true);
   };

   const showLoginFromSignup = () => {
      setShowSignupDropdown(false);
      setShowLoginDropdown(true);
   };

   useEffect(() => {
      const handleDocClick = (e) => {
         const t = e.target;
         if (!(showLoginDropdown || showSignupDropdown)) return;

         const clickedInsideLogin = loginDropdownRef.current && loginDropdownRef.current.contains(t);
         const clickedInsideSignup = signupDropdownRef.current && signupDropdownRef.current.contains(t);
         const clickedLoginBtn = loginBtnRef.current && loginBtnRef.current.contains(t);
         const clickedSignupBtn = signupBtnRef.current && signupBtnRef.current.contains(t);

         if (!clickedInsideLogin && !clickedInsideSignup && !clickedLoginBtn && !clickedSignupBtn) {
            setShowLoginDropdown(false);
            setShowSignupDropdown(false);
         }
      };

      const handleEsc = (e) => {
         if (e.key === "Escape") {
            setShowLoginDropdown(false);
            setShowSignupDropdown(false);
         }
      };

      document.addEventListener("mousedown", handleDocClick);
      document.addEventListener("touchstart", handleDocClick);
      document.addEventListener("keydown", handleEsc);

      return () => {
         document.removeEventListener("mousedown", handleDocClick);
         document.removeEventListener("touchstart", handleDocClick);
         document.removeEventListener("keydown", handleEsc);
      };
   }, [showLoginDropdown, showSignupDropdown]);

   const renderAuthSection = () => {
      if (authLoading) {
         return (
            <div className="flex items-center justify-center w-full">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
               <span className="ml-2 text-green-600 max-sm:text-xs">Loading...</span>
            </div>
         );
      }

      if (user) {
         return (
            <div className="flex items-center space-x-4 col-start-3 w-full justify-center">
               <span className="text-green-700 font-medium max-sm:text-xs">Welcome, {user?.name || "User"}</span>
               <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-xs font-medium cursor-pointer ml-1.4 max-sm:px-2 max-sm:py-1 max-sm:ml-0.4">
                  Logout
               </button>
            </div>
         );
      }

      return (
         <div className="navbar-right flex gap-4 justify-center col-start-3 max-sm:col-start-2 w-full h-full items-center max-[770px]:col-start-2 ">
            <button
               ref={loginBtnRef}
               className="btn bg-green-700 py-2 px-4 rounded-radius hover:bg-green-800 cursor-pointer text-gray-50 text-xs transition-colors duration-200 rounded-sm h-max max-sm:py-1 max-sm:px-2"
               onClick={toggleLogin}>
               Log in
            </button>

            <button
               ref={signupBtnRef}
               className="btn bg-green-700 py-2 px-4 rounded-radius hover:bg-green-800 cursor-pointer text-gray-50 text-xs transition-colors duration-200 rounded-sm h-max max-sm:py-1 max-sm:px-2">
               Contact us
            </button>
         </div>
      );
   };

   return (
      <nav className="NAVBAR w-full min-w-full grid justify-between items-center sticky top-0 p-3 bg-green-100 z-50 grid-cols-3 max-sm:grid-cols-2 grid-rows-1 max-[770px]:grid-cols-2">
         <div className="togglebtn lg:hidden flex justify-start max-sm:col-start-1 max-sm:row-start-1 max-[770px]:col-start-1 max-[770px]:row-start-1 ">
            <Button
               onClick={() => {
                  setVisible(true);
                  SetshowSidebar(!showSidebar);
               }}
               icon="pi pi-arrow-right">
               <IoReorderThreeOutline className="text-3xl hover:bg-black col-start-1" />
            </Button>
         </div>

         <div className="text-2xl font-extrabold flex justify-center text-green-700 col-start-1 max-[321px]:text-xs max-sm:col-start-1 max-sm:row-start-1 max-sm:ml-8 max-[380px]:text-base max-[430px]:text-lg max-[770px]:text-2xl max-[770px]:row-start-1">
            <h1 className="select-none">Dr. Atif Shahzad</h1>
         </div>

         <Sidebar
            visible={visible}
            onHide={() => setVisible(false)}
            className="bg-green-200 max-w-1/2 md:max-w-1/4"
            closeIcon={<IoCloseSharp className="text-2xl text-green-700 m-2" />}>
            <div className="navbar-left flex items-center list-none justify-center gap-16 col-start-2">
               <ul className="flex gap-4 items-center justify-center flex-col mt-10">
                  <Link to={"/"}>
                     <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                        Home
                     </li>
                  </Link>
                  {/* <Link to={"/courses"}>
                     <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                        Courses
                     </li>
                  </Link> */}
                  <Link to={"/ncaaa"}>
                     <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                        NCAAA
                     </li>
                  </Link>
                  {user && user.role === "admin" && (
                     <Link to={"/admin"}>
                        <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                           Admin Panel
                        </li>
                     </Link>
                  )}
                  <Link
                     to={"/about"}
                     className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                     About
                  </Link>
               </ul>
            </div>
         </Sidebar>

         <div className="navbar-left flex items-center list-none justify-center gap-16 col-start-2 max-[770px]:hidden">
            <ul className="flex gap-9 items-center justify-center">
               <Link to={"/"}>
                  <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                     Home
                  </li>
               </Link>
               {/* <Link to={"/courses"}>
                  <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                     Courses
                  </li>
               </Link> */}
               <Link
                  to={"/ncaaa"}
                  className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                  NCAAA
               </Link>
               {user && user.role === "admin" && (
                  <Link to={"/admin"}>
                     <li className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                        Admin Panel
                     </li>
                  </Link>
               )}
               <Link
                  to={"/about"}
                  className="text-green-600 cursor-pointer hover:text-green-800 font-semibold hover:underline transition-colors duration-200">
                  About
               </Link>
            </ul>
         </div>

         {renderAuthSection()}

         {!user &&
            showLoginDropdown &&
            createPortal(
               <div ref={loginDropdownRef} className="fixed right-16 top-16 z-[9999] pointer-events-auto">
                  <LoginDropdown openSignup={showSignupFromLogin} />
               </div>,
               document.body
            )}

         {!user &&
            showSignupDropdown &&
            createPortal(
               <div ref={signupDropdownRef} className="fixed right-16 top-16 z-[9999] pointer-events-auto">
                  <SignupDropdown openLogin={showLoginFromSignup} />
               </div>,
               document.body
            )}
      </nav>
   );
};

export default Navbar;
