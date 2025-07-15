/**
 * AI Configuration Status Component
 *
 * Displays the current status of Gemini AI integration
 * Shows configuration status, connection health, and provider info
 */

import React from "react";
import { Brain, CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";

interface AIConfigStatusProps {
  isEnabled?: boolean;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const AIConfigStatus: React.FC<AIConfigStatusProps> = ({
  isEnabled = false,
  loading = false,
  error = null,
  className = "",
}) => {
  // Check if Gemini API key is configured
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isGeminiConfigured = geminiApiKey && geminiApiKey.startsWith("AIza");

  // Determine status
  const getStatus = () => {
    if (loading) return "loading";
    if (error) return "error";
    if (isGeminiConfigured && isEnabled) return "active";
    if (isGeminiConfigured && !isEnabled) return "configured";
    return "not-configured";
  };

  const status = getStatus();

  // Status configurations
  const statusConfig = {
    loading: {
      icon: Loader,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      message: "Gemini AI is working...",
      iconClass: "animate-spin",
    },
    active: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      message: "Gemini AI is active and ready",
      iconClass: "",
    },
    configured: {
      icon: Brain,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      message: "Gemini AI is configured",
      iconClass: "",
    },
    error: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      message: `Gemini AI error: ${error}`,
      iconClass: "",
    },
    "not-configured": {
      icon: AlertCircle,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      message: "Gemini AI not configured",
      iconClass: "",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all duration-200 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex items-center gap-3">
        

        {/* Configuration Indicator */}
        <div className="flex-shrink-0">
          {isGeminiConfigured ? (
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Additional Details for Development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">             
              <span
                className={
                  isGeminiConfigured ? "text-green-600" : "text-red-600"
                }
              >
                {isGeminiConfigured ? "✓ Configured" : "✗ Missing"}
              </span>
            </div>        
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfigStatus;
