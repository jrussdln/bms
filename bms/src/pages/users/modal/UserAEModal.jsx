import { useEffect, useState } from "react";
import { usersApi } from "../../../api/endpoints/users.api";
import { USER_ROLE, ROLE_LABELS } from "../../../constants/user-roles";
import {
  STATUS_KEYS,
  ACCOUNT_STATUS_OPTIONS,
} from "../../../constants/user-status";
import Fields from "../../../components/form/Fields";
import Modal from "../../../layouts/modal/Modal";
const emptyForm = {
  strFName: "",
  strMName: "",
  strLName: "",
  strEName: "",
  strPhoneNumber: "",
  strEmail: "",
  strPassword: "",
  strPassword_confirmation: "",
  cUserRole: USER_ROLE.USER,
  cAccountStatus: STATUS_KEYS.ACTIVE,
};
const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function UserAEModal({ open, onClose, onSaved, user }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        strFName: user.strFName ?? "",
        strMName: user.strMName ?? "",
        strLName: user.strLName ?? "",
        strEName: user.strEName ?? "",
        strPhoneNumber: user.strPhoneNumber ?? "",
        strEmail: user.strEmail ?? "",
        strPassword: "",
        strPassword_confirmation: "",
        cUserRole: user.cUserRole ?? USER_ROLE.USER,
        cAccountStatus: user.cAccountStatus ?? STATUS_KEYS.ACTIVE,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async () => {
    setSaving(true);
    setErrors({});

    const payload = {
      strFName: form.strFName,
      strMName: form.strMName,
      strLName: form.strLName,
      strEName: form.strEName,
      strPhoneNumber: form.strPhoneNumber,
      strEmail: form.strEmail,
      cUserRole: form.cUserRole,
      cAccountStatus: form.cAccountStatus,
    };
    if (form.strPassword || !isEdit) {
      payload.strPassword = form.strPassword;
      payload.strPassword_confirmation = form.strPassword_confirmation;
    }

    try {
      if (isEdit) {
        await usersApi.update(user.nUserId, payload);
      } else {
        await usersApi.create(payload);
      }
      onClose(); // only this — no onSaved()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        alert(err.response?.data?.message ?? "Failed to save user.");
      }
    } finally {
      setSaving(false);
    }
  };
  const fields = [
    { name: "user-info-label", type: "label", label: "User Information" },
    { name: "strFName", label: "First Name", xs: 6 },
    { name: "strMName", label: "Middle Name", xs: 6 },
    { name: "strLName", label: "Last Name", xs: 6 },
    { name: "strEName", label: "Ext. Name (Jr., Sr., III)", xs: 6 },
    { name: "account-info-label", type: "label", label: "Account Information" },
    { name: "strEmail", type: "email", label: "Email", xs: 5 },
    { name: "strPhoneNumber", type: "phone", label: "Phone Number", xs: 4 },
    {
      name: "cUserRole",
      type: "select",
      label: "Role",
      options: roleOptions,
      xs: 3,
    },
    {
      name: "strPassword",
      type: "password",
      label: isEdit ? "New Password" : "Password",
      placeholder: isEdit ? "Leave blank to keep current" : "",
      xs: 12,
    },
    {
      name: "strPassword_confirmation",
      type: "password",
      label: "Confirm Password",
      xs: 12,
    },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add User"}
      subtitle={form.strFName ? ` / ${form.strFName}` : ""}
      onSave={handleSubmit}
      saveLabel={isEdit ? "Save Changes" : "Add User"}
      saving={saving}
    >
      <Fields
        fields={fields}
        formData={form}
        errors={errors}
        handleChange={handleChange}
        onLastFieldTab={handleSubmit}
      />
    </Modal>
  );
}
