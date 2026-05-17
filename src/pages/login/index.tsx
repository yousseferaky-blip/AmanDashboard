import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff, HiUser, HiLockClosed } from "react-icons/hi";
import logo from "../../assets/logo.png";
import axiosInstance from "../../api/AxiosIntance";
import Swal from "sweetalert2";
import { getAllowedRoutes } from "../../utils/auth";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const allowedRoutes = getAllowedRoutes();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const { data } = await axiosInstance.post("/Auth/admin/login", {
        email: formData.email,
        password: formData.password,
      });
      const user = data?.data;
      
      if (user?.token) {
        localStorage.setItem("accessToken", user.token);
        localStorage.setItem("currentUser", JSON.stringify(user));
      }
      await Swal.fire({
        title: "تم تسجيل الدخول بنجاح",
        text: "مرحباً بك في لوحة التحكم",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      // navigate("/");
      navigate(allowedRoutes[0] || "/");

    } catch (err: any) {
      await Swal.fire({
        title: "فشل تسجيل الدخول",
        text: "تحقق من بيانات الاعتماد الخاصة بك",
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك</h1>
          <p className="text-gray-400">سجل دخولك للوصول إلى لوحة التحكم</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition-all duration-200"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition-all duration-200"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showPassword ? (
                    <HiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#F39500] focus:ring-indigo-800 border-gray-600 rounded bg-gray-800/50"
                />
                <label htmlFor="rememberMe" className="mr-2 block text-sm text-gray-300">
                  تذكرني
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-[#F39500] hover:text-orange-400 transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </div> */}

            {/* Login Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className={`w-full bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                submitting
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl"
              }`}
            >
              {submitting ? "جاري الدخول..." : "تسجيل الدخول"}
            </motion.button>
          </form>

          {/* Divider */}
          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">أو</span>
              </div>
            </div>
          </div> */}

          {/* Social Login */}
          {/* <div className="mt-6">
            <button className="w-full bg-gray-800/50 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-200 border border-gray-600">
              تسجيل الدخول بـ Google
            </button>
          </div> */}

          {/* Sign Up Link */}
          {/* <div className="mt-6 text-center">
            <p className="text-gray-400">
              ليس لديك حساب؟{' '}
              <Link
                to="/register"
                className="text-[#F39500] hover:text-orange-400 font-medium transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
