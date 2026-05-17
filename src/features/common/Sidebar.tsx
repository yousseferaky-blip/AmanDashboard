import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  HiHome,
  HiCube,
  HiClipboardList,
  HiUsers,
  HiCog,
  HiUser,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
  HiChevronUp,
  HiLogout,
  HiUserGroup,
  HiTruck,
  HiCreditCard,
  HiKey,
  HiDocumentReport,
  HiTrendingUp,
  HiPhone,
  HiOutlineShieldCheck,
  HiOutlineKey,
} from "react-icons/hi";
import { BiMessage, BiNotification } from "react-icons/bi";
import { IoIosNotifications } from "react-icons/io";
import { HiOutlineMegaphone } from "react-icons/hi2";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen: _isOpen,
  onToggle: _onToggle,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Persist collapsed state and auto-close dropdown when collapsing
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    } catch {}
    if (isCollapsed) {
      setUsersDropdownOpen(false);
    }
  }, [isCollapsed]);

  // Restore collapsed state on mount (optional, only if parent doesn't manage)
  // Note: If parent controls isCollapsed, remove this block.
  // useEffect(() => {
  //   const saved = localStorage.getItem('sidebarCollapsed');
  //   if (saved !== null) {
  //     // no-op here because state is lifted in parent
  //   }
  // }, []);
const userPermissions: string[] = (() => {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return user.permissions?.map((p: any) => p.name) || [];
  } catch {
    return [];
  }
})();

  const menuItems = [
    { id: 1, name: "الرئيسية", icon: HiHome, path: "/", hasDropdown: false },
    {
      id: 2,
      name: "المستخدمين",
      icon: HiUsers,
      path: "/users",
      hasDropdown: true,
      subItems: [
        // { id: 'users-all', name: 'جميع المستخدمين', icon: HiUsers, path: '/users' },
        {
          id: "users-drivers",
          name: "السائقين",
          icon: HiTruck,
          path: "/drivers",
        },
        {
          id: "users-clients",
          name: "العملاء",
          icon: HiUserGroup,
          path: "/clients",
        },
        // { id: 'users-employees', name: 'الموظفون', icon: HiUser, path: '/employees' }
      ],
    },
    {
      id: 3,
      name: "الرحلات",
      icon: HiClipboardList,
      path: "/trips",
      hasDropdown: false,
    },
    {
      id: 4,
      name: "أنواع السيارات",
      icon: HiCube,
      path: "/car-types",
      hasDropdown: false,
    },
    {
      id: 9,
      name: "السيارات",
      icon: HiTruck,
      path: "/cars",
      hasDropdown: false,
    },
    {
      id: 10,
      name: "المستويات",
      icon: HiTrendingUp,
      path: "/levels",
      hasDropdown: false,
    },
    // { id: 5, name: 'المحفظات', icon: HiCreditCard, path: '/wallets', hasDropdown: false },
    {
      id: 7,
      name: "التقارير",
      icon: HiDocumentReport,
      path: "/reports",
      hasDropdown: false,
    },
    {
      id: 11,
      name: "الكوبونات",
      icon: HiCreditCard,
      path: "/coupons",
      hasDropdown: false,
    },
    {
      id: 12,
      name: "ارقام التلفونات",
      icon: HiPhone,
      path: "/phoneNumber",
      hasDropdown: false,
    },
    {
      id: 23,
      name: "الاعلانات",
      icon: HiOutlineMegaphone ,
      path: "/advertisement",
      hasDropdown: false,
    },
    {
      id: 203,
      name: "الصلاحيات",
      icon: HiOutlineShieldCheck  ,
      path: "/permission",
      hasDropdown: false,
    },
    {
      id: 204,
      name: "رموز التحقق",
      icon: HiOutlineKey  ,
      path: "/verification-codes",
      hasDropdown: false,
    },
    {
      id: 13,
      name: "الاشعارات",
      icon: IoIosNotifications ,
      path: "/notification",
      hasDropdown: false,
    },
    {
      id: 14,
      name: "المحادثات",
      icon: BiMessage ,
      path: "/message",
      hasDropdown: false,
    },
    {
      id: 8,
      name: "الإعدادات",
      icon: HiCog,
      path: "/settings",
      hasDropdown: false,
    },
  ];

const filteredMenuItems = menuItems.filter((item) => {
 
  if (item.subItems && item.subItems.length > 0) {
    return item.subItems.some((sub) =>
      userPermissions.includes(sub.name)
    );
  }

  // الصفحات العادية
  return userPermissions.includes(item.name);
});



  const toggleUsersDropdown = () => {
    setUsersDropdownOpen(!usersDropdownOpen);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const isUsersActive = () => {
    return (
      location.pathname === "/users" ||
      location.pathname === "/drivers" ||
      location.pathname === "/clients" ||
      location.pathname === "/employees"
    );
  };

  return (

    <motion.div
  initial={false}
  animate={{ width: isCollapsed ? 90 : 256 }}
  transition={{ type: "spring", stiffness: 260, damping: 30 }}
  className={`
    fixed top-0 right-0 h-full bg-[#022949] shadow-2xl z-50
    border-l border-[#0a3a5c]
    flex flex-col
    ${isCollapsed ? "w-12 sm:w-16" : "w-48 sm:w-64"}
  `}
>
  {/* Header with Centered Logo */}
  <div className="flex-shrink-0 p-2 sm:p-4 border-b border-[#0a3a5c] bg-[#022949]">
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center w-full">
        <button
          onDoubleClick={onToggleCollapse}
          className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D89022]"
          aria-label="شعار"
          title="تبديل طي الشريط الجانبي"
        >
          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
        </button>
      </div>

      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center p-1 sm:p-2 rounded-lg hover:bg-[#0a3a5c] transition-colors"
        title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
        aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
      >
        {isCollapsed ? (
          <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </button>
    </div>
  </div>

  {/* Navigation Section */}
  <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
    <div className="space-y-1 sm:space-y-2">
      {filteredMenuItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative group"
        >
          {item.hasDropdown ? (
            <div>
              <motion.button
                onClick={toggleUsersDropdown}
                whileHover={{ scale: 1.02, x: isCollapsed ? 0 : -3 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  isUsersActive()
                    ? "bg-[#D89022] text-white border-r-2 border-[#F58818] shadow-lg"
                    : "text-gray-300 hover:bg-[#D89022]/20 hover:text-white hover:shadow-md"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={item.name}
                aria-label={item.name}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <item.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isUsersActive() ? "text-white" : "text-[#9FA0A4]"
                    }`}
                  />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="font-medium text-sm sm:text-base"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {!isCollapsed && (
                  <motion.div
                    animate={{ rotate: usersDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {usersDropdownOpen ? (
                      <HiChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#9FA0A4]" />
                    ) : (
                      <HiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#9FA0A4]" />
                    )}
                  </motion.div>
                )}
              </motion.button>

              {/* Dropdown Items */}
              <AnimatePresence>
                {usersDropdownOpen && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 sm:mt-2 mr-2 sm:mr-4 space-y-1"
                  >
                    {item.subItems
                      ?.filter((subItem) => userPermissions.includes(subItem.name))
                      .map((subItem) => (
                      <motion.div
                        key={subItem.id}
                        whileHover={{ scale: 1.02, x: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={subItem.path}
                          className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                            isActive(subItem.path)
                              ? "text-white bg-[#D89022]"
                              : "text-[#9FA0A4] hover:bg-[#D89022]/20 hover:text-white"
                          }`}
                        >
                          <div
                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                              isActive(subItem.path) ? "bg-white" : "bg-[#9FA0A4]"
                            }`}
                          />
                          <span>{subItem.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed Dropdown Items */}
              <AnimatePresence>
                {usersDropdownOpen && isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 sm:mt-2 space-y-1"
                  >
                    {item.subItems
                      ?.filter((subItem) => userPermissions.includes(subItem.name))
                      .map((subItem) => (
                      <motion.div
                        key={subItem.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={subItem.path}
                          className={`flex items-center justify-center p-2 sm:p-3 rounded-md sm:rounded-lg transition-all duration-200 ${
                            isActive(subItem.path)
                              ? "text-white bg-[#D89022]"
                              : "text-[#9FA0A4] hover:bg-[#D89022]/20 hover:text-white"
                          }`}
                          title={subItem.name}
                          aria-label={subItem.name}
                        >
                          <subItem.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip */}
              {isCollapsed && (
                <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-[#011a33] text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-[#0a3a5c]">
                    {item.name}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02, x: isCollapsed ? 0 : -3 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Link
                to={item.path}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-[#D89022] text-white border-r-2 border-[#F58818] shadow-lg"
                    : "text-gray-300 hover:bg-[#D89022]/20 hover:text-white hover:shadow-md"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={item.name}
                aria-label={item.name}
              >
                <item.icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive(item.path) ? "text-white" : "text-[#9FA0A4]"
                  }`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="font-medium text-sm sm:text-base"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Tooltip */}
              {isCollapsed && (
                <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="bg-[#011a33] text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-[#0a3a5c]">
                    {item.name}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  </nav>

  {/* Admin Card at Bottom */}
  <div className="flex-shrink-0 p-2 sm:p-4 border-t border-[#0a3a5c] bg-[#011a33]">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`flex items-center gap-2 sm:gap-3 ${isCollapsed ? "justify-center" : ""}`}
    >
      <div className="relative">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#D89022] to-[#F58818] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
          <HiUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 rounded-full border border-[#011a33] sm:border-2" />
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-xs sm:text-sm">مدير النظام</p>
                <p className="text-xs text-[#9FA0A4] hidden sm:block">admin@example.com</p>
              </div>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("currentUser");
                  } catch {}
                  navigate("/login");
                }}
                className="p-1 sm:p-2 rounded-md sm:rounded-lg hover:bg-[#0a3a5c] transition-colors"
              >
                <HiLogout className="w-3 h-3 sm:w-4 sm:h-4 text-[#9FA0A4]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
</motion.div>

  );
};

export default Sidebar;
