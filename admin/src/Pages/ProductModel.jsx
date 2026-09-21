// src/components/ProductModal.jsx
import React, { useEffect, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Modal from "../components/Model";
import TextInput from "../components/Input"; // your reusable input/textarea


import { uploadImage } from "../api/Upload";
import { getActiveCategories } from "../api/Category";
import { getActiveBrands } from "../api/Brand";
import { createProduct, updateProduct, getProductById } from "../api/Product";

const MAX_IMAGES = 3;

export default function ProductModal({ open, onClose, onSuccess, editData }) {
  const isEditMode = Boolean(editData?.id);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Load categories + brands once
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getActiveCategories(),
          getActiveBrands(),
        ]);

        setCategories(catRes?.data ?? catRes ?? []);
        setBrands(brandRes?.data ?? brandRes ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    loadMeta();
  }, []);

  // normalize imageUrl (string | string[] | postgres string)
  const normalizeImageUrls = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    if (typeof raw === "string") {
      let str = raw.trim();
      if (!str) return [];

      if (str.startsWith("{") && str.endsWith("}")) str = str.slice(1, -1);

      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed;
      } catch {}

      return str
        .split(",")
        .map((s) => s.replace(/"/g, "").trim())
        .filter(Boolean);
    }
    return [];
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      editData={editData}
      titleAdd="Add Product"
      titleEdit="Edit Product"
      subtitleAdd="Create a new product with full details"
      subtitleEdit="Update product details"
      addBtnText="Create Product"
      editBtnText="Update Product"
      initialForm={{
        name: "",
        description: "",
        price: "",
        categoryId: "",
        brandId: "",
        imageFiles: [],
        imagePreviews: [],
        imageUrls: [],
        isActive: true,
      }}
      buildEditForm={async (data) => {
        // fetch latest product
        const prod = await getProductById(data.id);
        const existing = normalizeImageUrls(prod.imageUrl).slice(0, MAX_IMAGES);

        return {
          name: prod.name || "",
          description: prod.description || "",
          price: prod.price ?? "",
          categoryId: prod.categoryId ?? "",
          brandId: prod.brandId ?? "",
          imageFiles: [],
          imagePreviews: existing,
          imageUrls: existing,
          isActive: prod.isActive ?? true,
        };
      }}
      validate={(form, isEditMode) => {
        if (!form.name.trim()) return "Product name is required";
        if (!form.price || isNaN(form.price)) return "Valid price is required";
        if (!form.categoryId) return "Select a category";
        if (!form.brandId) return "Select a brand";

        const total = (form.imagePreviews?.length || 0);
        if (!isEditMode && total === 0) return "At least one product image is required";
        if (total > MAX_IMAGES) return `Only ${MAX_IMAGES} images are allowed`;

        return null;
      }}
      onSubmit={async (form, isEditMode, editData) => {
        // start with existing URLs (already removed ones are not present)
        let finalImageUrls = [...(form.imageUrls || [])].slice(0, MAX_IMAGES);

        // upload new files only up to remaining
        const remaining = MAX_IMAGES - finalImageUrls.length;
        const filesToUpload = (form.imageFiles || []).slice(0, remaining);

        for (const file of filesToUpload) {
          const imgRes = await uploadImage(file);
          if (!imgRes?.url) throw new Error("One of the image uploads failed");
          finalImageUrls.push(imgRes.url);
        }

        const payload = {
          name: form.name.trim(),
          description: (form.description || "").trim(),
          price: Number(form.price),
          categoryId: Number(form.categoryId),
          brandId: Number(form.brandId),
          imageUrl: finalImageUrls, // string[]
          isActive: form.isActive,
        };

        if (isEditMode) await updateProduct(editData.id, payload);
        else await createProduct(payload);
      }}
      renderLeft={({ form, setForm }) => (
        <>
          <h3 className="text-base font-semibold mb-4 text-slate-900">
            Product Information
          </h3>

          <div className="space-y-4">
            <TextInput
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <TextInput
              rows={4}
              placeholder="Enter product description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />

            <TextInput
              type="number"
              placeholder="Price (INR)"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />

            {/* Category */}
            <div>
              <p className="text-xs mb-1 block text-slate-600">Category</p>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, categoryId: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <p className="text-xs mb-1 block text-slate-600">Brand</p>
              <select
                value={form.brandId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, brandId: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="rounded border-slate-300"
                id="productIsActive"
              />
              <label htmlFor="productIsActive" className="text-sm text-slate-700">
                Active
              </label>
            </div>
          </div>
        </>
      )}
      renderRight={({ form, setForm }) => {
        const handleImageChange = (e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;

          const currentCount = (form.imagePreviews || []).length;
          const remaining = MAX_IMAGES - currentCount;

          if (remaining <= 0) {
            alert(`Only ${MAX_IMAGES} images are allowed.`);
            e.target.value = "";
            return;
          }

          const allowed = files.slice(0, remaining);
          if (files.length > remaining) {
            alert(`Only ${MAX_IMAGES} images are allowed. Extra images ignored.`);
          }

          const previews = allowed.map((f) => URL.createObjectURL(f));

          setForm((p) => ({
            ...p,
            imageFiles: [...(p.imageFiles || []), ...allowed],
            imagePreviews: [...(p.imagePreviews || []), ...previews],
          }));

          e.target.value = "";
        };

        const handleRemovePreview = (index) => {
          setForm((prev) => {
            const newPreviews = [...(prev.imagePreviews || [])];
            newPreviews.splice(index, 1);

            let newImageUrls = [...(prev.imageUrls || [])];
            let newImageFiles = [...(prev.imageFiles || [])];

            if (index < newImageUrls.length) {
              newImageUrls.splice(index, 1);
            } else {
              const fileIndex = index - newImageUrls.length;
              if (fileIndex >= 0 && fileIndex < newImageFiles.length) {
                newImageFiles.splice(fileIndex, 1);
              }
            }

            return {
              ...prev,
              imagePreviews: newPreviews,
              imageUrls: newImageUrls,
              imageFiles: newImageFiles,
            };
          });
        };

        return (
          <>
            <h3 className="text-base font-semibold mb-2 text-slate-900">
              Product Images
            </h3>

            <p className="text-xs text-slate-500 mb-3">
              {form.imagePreviews.length}/{MAX_IMAGES} images
            </p>

            <label
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition ${
                form.imagePreviews.length >= MAX_IMAGES
                  ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-70"
                  : "bg-slate-50 border-slate-300 hover:bg-slate-100 cursor-pointer"
              }`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-sm text-slate-700">
                {form.imagePreviews.length >= MAX_IMAGES
                  ? "Maximum images reached"
                  : "Click to upload images"}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Max {MAX_IMAGES} images (PNG/JPG)
              </span>

              <input
                type="file"
                multiple
                className="hidden"
                disabled={form.imagePreviews.length >= MAX_IMAGES}
                onChange={handleImageChange}
              />
            </label>

            {/* previews */}
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Preview</p>

              {form.imagePreviews.length === 0 ? (
                <div className="h-24 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                  No images selected yet.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                  {form.imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white"
                    >
                      <img
                        src={src}
                        alt={`Preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                        onClick={() => handleRemovePreview(idx)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      }}
    />
  );
}
