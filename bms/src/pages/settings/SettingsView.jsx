import Fields from "../../components/form/Fields";
import Button from "../../components/form/Buttons";
import ParentCard from "../../components/card/ParentCard";
import ChildCard from "../../components/card/ChildCard";
import AvatarUpload from "../../components/image/avatar/AvatarUpload";
export default function SettingsView({
  tabs,
  activeTab,
  setActiveTab,

  profile,
  loadingUser,
  userError,

  uploadingAvatar,
  avatarError,
  handleAvatarUpload,

  profileForm,
  profileErrors,
  savingProfile,
  handleProfileFieldChange,
  handleSaveProfile,

  passwordForm,
  passwordErrors,
  updatingAccount,
  handlePasswordFieldChange,
  handleUpdateAccount,

  theme,
  setTheme,

  loggingOut,
  handleLogout,
}) {
  const personalFields = [
    { name: "strFName", label: "First Name", xs: 6, disabled: loadingUser },
    { name: "strMName", label: "Middle Name", xs: 6, disabled: loadingUser },
    { name: "strLName", label: "Last Name", xs: 6, disabled: loadingUser },
    {
      name: "strEName",
      label: "Ext. Name (Jr., Sr., III)",
      xs: 6,
      disabled: loadingUser,
    },
    {
      name: "strPhoneNumber",
      type: "phone",
      label: "Phone Number",
      xs: 6,
      disabled: loadingUser,
    },
    {
      name: "strEmail",
      type: "email",
      label: "Email Address",
      xs: 6,
      disabled: loadingUser,
    },
  ];

  const passwordFields = [
    {
      name: "password",
      label: "New Password",
      type: "password",
      placeholder: "New password",
      xs: 12,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm new password",
      xs: 12,
    },
  ];

  return (
    <div className="space-y-4">
      {userError && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {userError}
        </div>
      )}

      {/* Profile Card — click the avatar to change + crop the photo directly */}
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <AvatarUpload
              mode="view"
              currentUrl={profile.avatarUrl}
              name={profile.name}
              onUpload={handleAvatarUpload}
              uploading={uploadingAvatar}
            />
            {avatarError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center max-w-24">
                {avatarError}
              </p>
            )}
          </div>

          {loadingUser ? (
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-44 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
            </div>
          ) : (
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {profile.name || "—"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile.email}
              </p>
              {profile.role && (
                <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  {profile.role}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + Logout row */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mb-3">
          <Button
            label={loggingOut ? "Logging out..." : "Logout"}
            actionColor="delete"
            onClick={handleLogout}
            disabled={loggingOut}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <ParentCard
          title="Personal Information"
          columns="grid-cols-1"
          className="max-w-lg"
        >
          <div className="space-y-4 mt-3">
            <Fields
              fields={personalFields}
              formData={profileForm}
              errors={profileErrors}
              handleChange={handleProfileFieldChange}
              autoFocus={false}
            />
            <Button
              label={savingProfile ? "Saving..." : "Save Changes"}
              actionColor="save"
              onClick={handleSaveProfile}
              disabled={savingProfile || loadingUser}
            />
          </div>
        </ParentCard>
      )}

      {activeTab === "account" && (
        <ParentCard title="Account" columns="grid-cols-1" className="max-w-lg">
          <div className="space-y-4 mt-3">
            <Fields
              fields={passwordFields}
              formData={passwordForm}
              errors={passwordErrors}
              handleChange={handlePasswordFieldChange}
              autoFocus={false}
            />
            <Button
              label={updatingAccount ? "Updating..." : "Update Account"}
              actionColor="save"
              onClick={handleUpdateAccount}
              disabled={updatingAccount}
            />
          </div>
        </ParentCard>
      )}

      {activeTab === "appearance" && (
        <ParentCard
          title="Appearance"
          columns="grid-cols-1"
          className="max-w-lg"
        >
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Theme
            </p>
            <div className="flex gap-3">
              <Button
                label="Light"
                actionColor={theme === "light" ? "confirm" : "default"}
                onClick={() => setTheme("light")}
              />
              <Button
                label="Dark"
                actionColor={theme === "dark" ? "confirm" : "default"}
                onClick={() => setTheme("dark")}
              />
            </div>
          </div>
        </ParentCard>
      )}
    </div>
  );
}