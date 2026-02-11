import { Outlet } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Student System
          </h1>
          <LanguageSwitcher />
        </div>

        <div className="py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
