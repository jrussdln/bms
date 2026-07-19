import { useEffect, useState } from "react";
import Modal from "../../../layouts/modal/Modal";
import Fields from "../../../components/form/Fields";
import api from "../../../api/axios";
import { CATEGORY_LABELS } from "../../../constants/finance-category";
import { TYPE_LABELS } from "../../../constants/finance-type";
import {
  toDatetimeLocalValue,
  getCurrentDatetimeLocal,
  fromDatetimeLocalValue,
} from "../../../utils/helpers/time-zone";
// Single source of truth now lives in the constants files (also used by
// useRecordManagement for filtering/labels). Derive the `{ value, label }`
// shape Fields' select fields expect from those maps instead of keeping a
// second, hand-maintained copy in sync here.
const toOptions = (labelMap) =>
  Object.entries(labelMap).map(([value, label]) => ({ value, label }));

// Re-exported for any existing consumers (e.g. table displays) that still
// import CATEGORY_OPTIONS / TYPE_OPTIONS from this module.
export const CATEGORY_OPTIONS = toOptions(CATEGORY_LABELS);
export const TYPE_OPTIONS = toOptions(TYPE_LABELS);

const EMPTY_FORM = {
  strTitle: "",
  cCategory: "",
  cType: "",
  dAmount: "",
  strNote: "",
  dtOccur: "",
};

/**
 * Add/Edit modal for financial records.
 *
 * Intended to be driven by useRecordManagement:
 *   <RecordsAEModal
 *     open={modalOpen}
 *     onClose={handleModalClose}
 *     onSaved={fetchRecords}
 *     record={selectedRecord}
 *   />
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSaved: () => void — called after a successful create/update, so the
 *   parent can refetch the records list
 * - record: existing record row to edit (nRecordsId present), or null/undefined
 *   for "add" mode
 */
export default function FinanceAEModal({ open, onClose, onSaved, record }) {
  const isEdit = Boolean(record?.nRecordsId);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setFormData({
        strTitle: record.strTitle ?? "",
        cCategory: record.cCategory ?? "",
        cType: record.cType ?? "",
        dAmount: record.dAmount ?? "",
        strNote: record.strNote ?? "",
        dtOccur: toDatetimeLocalValue(record.dtOccur),
      });
    } else {
      setFormData({ ...EMPTY_FORM, dtOccur: getCurrentDatetimeLocal() });
    }
    setErrors({});
    setServerError("");
  }, [open, isEdit, record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const fields = [
    { name: "strTitle", label: "Title", xs: 6 },
    {
      name: "cCategory",
      label: "Category",
      type: "select",
      xs: 3,
      options: CATEGORY_OPTIONS,
    },
    {
      name: "cType",
      label: "Type",
      type: "select",
      xs: 3,
      options: TYPE_OPTIONS,
    },

    { name: "dAmount", label: "Amount", type: "peso", xs: 6 },
    { name: "dtOccur", label: "Date & Time", type: "datetime-local", xs: 6 },

    {
      name: "strNote",
      label: "Note",
      multiline: true,
      minRows: 2,
      xs: 12,
    },
  ];

const handleSave = async () => {
    setSaving(true);
    setServerError("");
    setErrors({});

    try {
      const payload = {
        ...formData,
        dtOccur: fromDatetimeLocalValue(formData.dtOccur),
      };

      if (isEdit) {
        await api.put(`/records/${record.nRecordsId}`, payload);
      } else {
        await api.post("/records", payload);
      }
      // No onSaved?.() — the "finance.updated" broadcast (created/updated) refreshes the table.
      onClose?.();
    } catch (err) {
      if (err.response?.status === 422) {
        const fieldErrors = {};
        Object.entries(err.response.data.errors ?? {}).forEach(
          ([key, messages]) => {
            fieldErrors[key] = messages[0];
          },
        );
        setErrors(fieldErrors);
      } else {
        setServerError(
          err.response?.data?.message ??
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Entry" : "Add Entry"}
      subtitle={formData.strTitle ? ` / ${formData.strTitle}` : ""}
      onSave={handleSave}
      saveLabel={isEdit ? "Update" : "Save"}
      saving={saving}
      type={isEdit ? "edit" : "add"}
    >
      {serverError && (
        <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: 12 }}>
          {serverError}
        </p>
      )}
      <Fields
        fields={fields}
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        autoFocus={open}
      />
    </Modal>
  );
}
