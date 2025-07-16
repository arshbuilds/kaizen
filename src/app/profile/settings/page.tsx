import LogoutButton from "@/src/components/Auth/LogoutButton";
import ProfileSettings from "@/src/components/Profile/ProfileSettings";
import React from "react";

const Settings = () => {
  return (
    <div className="min-h-screen p-4 mx-auto pb-24 pt-12">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <ProfileSettings/>
        <LogoutButton/>
      </div>
    </div>
  );
};

export default Settings;
