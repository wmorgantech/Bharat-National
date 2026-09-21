import React from "react";
import { UploadCloud } from "lucide-react";

import { uploadImage } from "../api/Upload";
import { createBrand, updateBrand } from "../api/Brand";

import Modal from "../components/Model";
import TextInput from "../components/Input";

export default function BrandModal({ open, onClose, onSuccess, editData }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      editData={editData}
      titleAdd="Add Brand"
      titleEdit="Edit Brand"
      subtitleAdd="Create a new product brand"
      subtitleEdit="Update brand details"
      addBtnText="Create Brand"
      editBtnText="Update Brand"
      initialForm={{
        name: "",
        description: "",
        imageFile: null,
        imagePreview: "",
        imageUrl: "",
        isActive: true,
      }}
      buildEditForm={(data) => ({
        name: data?.name || "",
        description: data?.description || "",
        imageFile: null,
        imagePreview: data?.imageUrl || data?.image || "",
        imageUrl: data?.imageUrl || data?.image || "",
        isActive: data?.isActive ?? true,
      })}
      validate={(form, isEditMode) => {
        if (!form.name.trim()) return "Brand name is required";
        if (!isEditMode && !form.imageFile) return "Brand image is required";
        return null;
      }}
      onSubmit={async (form, isEditMode, editData) => {
        let finalImageUrl = form.imageUrl;

        if (form.imageFile) {
          const imgRes = await uploadImage(form.imageFile);
          if (!imgRes?.url) throw new Error("Image upload failed");
          finalImageUrl = imgRes.url;
        }

        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          imageUrl: finalImageUrl,
          isActive: form.isActive,
        };

        if (isEditMode) await updateBrand(editData.id, payload);
        else await createBrand(payload);
      }}
      renderLeft={({ form, setForm }) => (
        <>
          <h3 className="text-base font-semibold mb-4 text-slate-900">
            Brand Information
          </h3>

          <div className="space-y-4">
            {/* Brand Name */}
            <TextInput
              name="brandName"
              placeholder="Enter brand name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            {/* ✅ Description using same TextInput component (textarea mode) */}
            <TextInput
              name="brandDescription"
              placeholder="Enter description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={4} // ✅ rows means textarea
            />

            {/* Active toggle */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="rounded border-slate-300"
                id="brandIsActive"
              />
              <label htmlFor="brandIsActive" className="text-sm text-slate-700">
                Active
              </label>
            </div>
          </div>
        </>
      )}
      renderRight={({ form, setForm, isEditMode }) => (
        <>
          <h3 className="text-base font-semibold mb-4 text-slate-900">
            Brand Logo / Image
          </h3>

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
            {form.imagePreview ? (
              <img
                src={form.imagePreview}
                className="h-full w-full object-cover rounded-xl"
                alt="Brand"
              />
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm text-slate-700">
                  Click to upload image
                </span>
                <span className="text-[11px] text-slate-400">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}

            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setForm((p) => ({
                  ...p,
                  imageFile: file,
                  imagePreview: URL.createObjectURL(file),
                }));
              }}
            />
          </label>

          {isEditMode && form.imageUrl && !form.imageFile && (
            <p className="mt-2 text-[11px] text-slate-400">
              Current image is kept. Choose a file above only if you want to
              replace it.
            </p>
          )}
        </>
      )}
    />
  );
}
