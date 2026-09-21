import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({
  open,
  onClose,
  onSuccess,
  editData,

  titleAdd = "Add",
  titleEdit = "Edit",
  subtitleAdd = "",
  subtitleEdit = "",

  initialForm,
  buildEditForm,
  validate,
  onSubmit,

  renderLeft,
  renderRight,

  addBtnText = "Create",
  editBtnText = "Update",
}) {
  const isEditMode = Boolean(editData?.id); // ✅
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => initialForm);

  useEffect(() => {
    if (!open) return;

    let alive = true;

    const load = async () => {
      try {
        if (isEditMode && buildEditForm) {
          setLoading(true);
          const nextForm = await buildEditForm(editData); // ✅ await
          if (!alive) return;
          setForm(nextForm);
        } else {
          setForm(initialForm);
        }
      } catch (e) {
        console.error(e);
        if (alive) setForm(initialForm);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [open, editData?.id]); // ✅

  if (!open) return null;

  const handleSubmit = async () => {
    const err = validate ? validate(form, isEditMode) : null;
    if (err) return alert(err);

    try {
      setLoading(true);
      await onSubmit(form, isEditMode, editData);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg border p-6 relative overflow-auto">
        <button
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          {isEditMode ? titleEdit : titleAdd}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {isEditMode ? subtitleEdit : subtitleAdd}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            {renderLeft?.({ form, setForm, loading, isEditMode })}
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            {renderRight?.({ form, setForm, loading, isEditMode })}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} type="button">
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? editBtnText
              : addBtnText}
          </Button>
        </div>
      </div>
    </div>
  );
}
