"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthPage() {
  const [params] = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarURL: "",
    phone: "",
    fullname: "",
    fullName: "",
    street: "",
    zipcode: "",
    city: "",
    country: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // API base URL
  const API_URL = "http://localhost:5000/api";
  const getGoogleAuthUrl = () => {
    const url = "https://accounts.google.com/o/oauth2/auth";
    const query = {
      client_id:
        "1065435437989-s24vtub6m0damkbqslkfoplhdg1s5ssg.apps.googleusercontent.com",
      redirect_uri: "http://localhost:5000/api/auth/oauth/google",
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      prompt: "consent",
      access_type: "offline",
    };
    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
  };

  const googleOAuthUrl = getGoogleAuthUrl();

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id:
            "1065435437989-s24vtub6m0damkbqslkfoplhdg1s5ssg.apps.googleusercontent.com",
          client_secret: "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",
          redirect_uri: "http://localhost:5000/auth/oauth/google",
          grant_type: "authorization_code",
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  };

  useEffect(() => {
    const code = params.get("code");
    if (code) {
      exchangeCodeForToken(code)
        .then((res) => {
          const { access_token } = res;
          localStorage.setItem("access_token", access_token);
          navigate("/");
        })
        .catch((error) => {
          ///console.error("Error exchanging code for token:", error);
        });
    }
  }, [params, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Lưu token và thông tin người dùng vào localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("currentUser", JSON.stringify(data.user));

          // Chuyển hướng về trang chủ
          navigate("/"); // Chuyển hướng về trang /
        } else {
          setError(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError("An error occurred during login");
      }
    } else {
      try {
        // Xử lý đăng ký người dùng mới
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: "buyer",
            avatarURL: formData.avatarURL,
            phone: formData.phone,
            fullName: formData.fullName,
            fullname: formData.fullname,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          setError(registerData.message || "Registration failed");
          return;
        }

        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem("token", registerData.token);
        localStorage.setItem("currentUser", JSON.stringify(registerData.user));

        // Chuyển hướng về trang chủ
        navigate("/");
      } catch (err) {
        setError("Unable to connect to the server");
        console.error("Registration error:", err);
      }
    }
  };

  return (
    <div id="AuthPage" className="w-full min-h-screen bg-white">
      <div className="w-full flex items-center justify-center p-5 border-b-gray-300">
        <a href="/" className="min-w-[170px]">
          <img width="170" src="/images/logo.svg" alt="Logo" />
        </a>
      </div>

      <div className="w-full flex items-center justify-center p-5 border-b-gray-300">
        <div className="flex gap-4">
          <button
            className={`font-semibold ${
              isLogin ? "text-blue-600" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
          </button>
          <span className="text-gray-300">|</span>
          <button
            className={`font-semibold ${
              !isLogin ? "text-blue-600" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Đăng ký
          </button>
        </div>
      </div>

      <div className="max-w-[400px] mx-auto px-2">
        {error && <div className="text-red-500 text-center my-2">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="User name"
                  className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Email"
              className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder="URL Avatar"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.avatarURL}
                  onChange={(e) =>
                    setFormData({ ...formData, avatarURL: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Street"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="State"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Quốc gia"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>

          {isLogin && (
            <a
              href="/forgot-password"
              className="text-center text-blue-600 hover:underline text-sm"
            >
              Quên mật khẩu?
            </a>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                hoặc tiếp tục với
              </span>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = googleOAuthUrl)}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm
              text-white rounded-md transition-colors duration-200 border border-white/30 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}
