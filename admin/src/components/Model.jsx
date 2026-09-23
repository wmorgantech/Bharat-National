import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
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

  // Success copy for the toast fired after a successful save. Parents only
  // refetch in onSuccess, so this is the single notification for the action.
  successAddText = "Created successfully",
  successEditText = "Updated successfully",
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
    if (err) return toast.error(err);

    try {
      setLoading(true);
      await onSubmit(form, isEditMode, editData);
      toast.success(isEditMode ? successEditText : successAddText);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-ink-900/60 backdrop-blur-sm
                 motion-safe:animate-[fadeIn_180ms_ease-out_both]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? titleEdit : titleAdd}
        className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto
                   rounded-2xl shadow-lift border border-ink-100
                   motion-safe:animate-[scaleIn_220ms_ease-out_both]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 border-b border-ink-100 bg-white/95 backdrop-blur-sm">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-ink-900">
              {isEditMode ? titleEdit : titleAdd}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {isEditMode ? subtitleEdit : subtitleAdd}
            </p>
          </div>

          <button
            className="btn-icon shrink-0"
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-5">
            {renderLeft?.({ form, setForm, loading, isEditMode })}
          </div>

          <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-5">
            {renderRight?.({ form, setForm, loading, isEditMode })}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-ink-100 bg-white/95 backdrop-blur-sm">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} type="button">
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
