/**
 * @file AccountSection.tsx
 * @description Premium React user interface component for the MovieFlix OTT client application.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import React from 'react';

interface AccountSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr] gap-4 py-[24px] border-b border-[#222] last:border-b-0 ${className}`}>
      <div className="text-[17px] font-bold text-[#808080] uppercase tracking-[-0.2px] pt-1">
        {title}
      </div>
      <div className="space-y-[18px]">
        {children}
      </div>
    </div>
  );
};

interface AccountRowProps {
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
}

export const AccountRow: React.FC<AccountRowProps> = ({ children, action }) => {
  return (
    <div className="flex items-start justify-between group py-1">
      <div className="flex-1 min-w-0 pr-6">
        {children}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={`text-[15px] font-medium text-[#0071eb] hover:text-blue-400 hover:underline whitespace-nowrap pt-0.5 transition-colors ${action.className || ""}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export const AccountInfo = ({ label, value, className = "" }: { label: string; value?: string; className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="text-[14px] text-[#999] mb-0.5 font-medium">{label}</div>
    <div className="text-[16px] text-white font-semibold tracking-tight">{value || "Not set"}</div>
  </div>
);
