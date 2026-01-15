import api from "@/lib/api";
import { Material } from "@/types/material";
import { toast } from "sonner";

// Helper to convert object to FormData
const createFormData = (data: any) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Skip undefined/null values
    if (value === null || value === undefined) return;

    // Handle File objects specifically
    if (value instanceof File) {
      formData.append(key, value);
    }
    // Handle Arrays (like topics/tags)
    else if (Array.isArray(value)) {
      // Django expects multiple values for same key or JSON string depending on implementation
      // For simple arrays, sending as JSON string is often safer with FormData
      formData.append(key, JSON.stringify(value));
    }
    // Handle Standard fields
    else {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

export const materialService = {
  // 1. GET ALL MATERIALS
  getAll: async (): Promise<Material[]> => {
    try {
      const response = await api.get<Material[]>('/materials/');
      return response.data;
    } catch (error) {
      console.error("Failed to load materials", error);
      toast.error("Could not fetch materials");
      return [];
    }
  },

  // 2. CREATE MATERIAL (Supports File Upload)
  create: async (material: Partial<Material> & { file?: File }): Promise<void> => {
    try {
      // Serializer uses 'code' field to write to 'code_snippet', so we pass it as is.
      const payload = { ...material };

      // Use FormData for file uploads
      const formData = createFormData(payload);

      await api.post('/materials/', formData);

      // Toast handled by UI component usually
    } catch (error) {
      console.error("Failed to create material", error);
      throw error;
    }
  },

  // 3. DELETE MATERIAL
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/materials/${id}/`);
    } catch (error) {
      console.error("Failed to delete material", error);
      throw error;
    }
  },

  // 4. UPDATE MATERIAL (Supports File Upload)
  update: async (id: string, material: Partial<Material> & { file?: File }): Promise<void> => {
    try {
      const payload = { ...material };
      const formData = createFormData(payload);

      await api.patch(`/materials/${id}/`, formData);
    } catch (error) {
      console.error("Failed to update material", error);
      throw error;
    }
  }
};