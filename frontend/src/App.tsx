import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login, Register, VerifyEmail, ConfirmEmail, ForgotPassword, ResetPassword } from "@features/auth";
import { AnonymousRoute, ProtectedRoute } from "@shared/index";
import MainPage from "./shared/pages/MainPage";
import { BoardPage, CardPage, UserBoardsPage } from "@features/kanban/index";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AnonymousRoute />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/boards" element={<UserBoardsPage />} />
            <Route path="/boards/:boardId" element={<BoardPage />}>
              <Route path="cards/:id" element={<CardPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </>
  );
}
