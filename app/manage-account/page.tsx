"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, Shield } from "lucide-react";

export default function ManageAccount() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Account</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Update your personal information and profile details.
          </p>
          <Button variant="outline">Edit Profile</Button>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Manage your app preferences and settings.
          </p>
          <Button variant="outline">Manage Preferences</Button>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Billing</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            View and manage your subscription and payment methods.
          </p>
          <Button variant="outline">View Billing</Button>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Manage your password and security settings.
          </p>
          <Button variant="outline">Security Settings</Button>
        </div>
      </div>
    </div>
  );
}
