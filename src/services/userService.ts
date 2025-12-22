import api from "@/lib/api";
import { User, UserRole, Student, Tutor, Affiliate } from "@/types/user";
import { toast } from "sonner";

// --- Helper: Build FormData from User Object ---
const buildUserFormData = (data: Partial<User> & { avatarFile?: File; resumeFile?: File }) => {
  const formData = new FormData();

  // 1. Standard Fields
  const appendIfPresent = (key: string, value: any) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  };

  appendIfPresent('name', data.name);
  appendIfPresent('email', data.email);
  appendIfPresent('phone', data.phone);
  appendIfPresent('is_profile_complete', data.isProfileComplete);
  appendIfPresent('status', data.status);
  appendIfPresent('password', data.password);
  appendIfPresent('role', data.role);
  appendIfPresent('reg_id', data.regId);

  if (data.avatarFile) {
    formData.append('avatar', data.avatarFile);
  }

  // 2. Role Specific Fields (FLATTENED for Backend)
  if (data.role === 'student') {
    const sData = data as any;
    // Basic Profile
    appendIfPresent('headline', sData.headline);
    appendIfPresent('bio', sData.bio);
    appendIfPresent('dob', sData.dob);
    appendIfPresent('address', sData.address);
    appendIfPresent('pincode', sData.pincode);
    appendIfPresent('qualification', sData.qualification);
    appendIfPresent('aim', sData.aim);

    // Rich Profile
    appendIfPresent('experience', sData.experience);
    if (data.resumeFile) {
      formData.append('resume', data.resumeFile);
    }

    // Academic (Missing in previous version)
    appendIfPresent('mentor', sData.mentor);
    appendIfPresent('coordinator', sData.coordinator);

    // Batch ID mapping
    const batchId = sData.batch || sData.batch_id;
    if (batchId) formData.append('batch_id', batchId);

    // JSON Arrays/Objects
    if (sData.skills) formData.append('skills', JSON.stringify(sData.skills));
    if (sData.socials) formData.append('socials', JSON.stringify(sData.socials));
    if (sData.projects) formData.append('projects', JSON.stringify(sData.projects));
    if (sData.achievements) formData.append('achievements', JSON.stringify(sData.achievements));
    if (sData.placement) formData.append('placement', JSON.stringify(sData.placement));

    // Coupon Code (Critical for Onboarding)
    appendIfPresent('coupon_code', sData.coupon_code);
  }

  if (data.role === 'tutor') {
    const tData = data as any;
    if (tData.topics) formData.append('topics', JSON.stringify(tData.topics));
  }

  if (data.role === 'affiliate') {
    const aData = data as any;
    appendIfPresent('platform', aData.platform);
    if (aData.couponCode) formData.append('coupon_code', aData.couponCode);

    // Onboarding
    appendIfPresent('whatsapp_number', aData.whatsappNumber);
    appendIfPresent('domain', aData.domain);
    appendIfPresent('address', aData.address);
    appendIfPresent('pincode', aData.pincode);
    appendIfPresent('dob', aData.dob);
    appendIfPresent('qualification', aData.qualification);
  }

  return formData;
};

// --- Helper: Clean JSON Payload ---
const buildUserJsonPayload = (data: Partial<User>) => {
  const payload: any = { ...data };

  // Remove File objects and frontend-only aliases
  delete payload.avatarFile;
  delete payload.resumeFile;
  if (typeof payload.avatar === 'string') delete payload.avatar;
  if (typeof payload.resume === 'string') delete payload.resume;

  // Remove Nested Profiles (Backend expects flat fields)
  delete payload.student_profile;
  delete payload.affiliate_profile;
  delete payload.tutor_profile;

  // Remove System Fields
  delete payload.id;
  delete payload.date_joined;
  delete payload.last_login;
  delete payload.groups;
  delete payload.user_permissions;

  // Ensure Flattened Fields for Student
  if (data.role === 'student') {
    const sData = data as any;
    if (sData.batch || sData.batch_id) {
      payload.batch_id = sData.batch || sData.batch_id;
    }
    // Mentor/Coordinator are top-level in 'data' usually, but good to ensure
    if (sData.mentor) payload.mentor = sData.mentor;
    if (sData.coordinator) payload.coordinator = sData.coordinator;
    if (sData.experience) payload.experience = sData.experience;
    if (sData.achievements) payload.achievements = sData.achievements;
    if (sData.placement) payload.placement = sData.placement;

    // Performance Flags
    if (sData.isTopPerformer !== undefined) payload.is_top_performer = sData.isTopPerformer;
    if (sData.isFeatured !== undefined) payload.is_featured_graduate = sData.isFeatured;

    // Coupon Code
    if (sData.couponCode) payload.coupon_code = sData.couponCode;
  }

  // Ensure Flattened Fields for Affiliate
  if (data.role === 'affiliate') {
    const aData = data as any;
    if (aData.couponCode) payload.coupon_code = aData.couponCode;
    if (aData.platform) payload.platform = aData.platform;
    if (aData.whatsappNumber) payload.whatsapp_number = aData.whatsappNumber;
    // domain, address, dob, qualification pass through via ...data copy
  }

  // Generic Mapping
  if (data.regId) {
    payload.reg_id = data.regId;
    delete payload.regId;
  }

  if (data.role === 'tutor') {
    const tData = data as any;
    if (tData.topics) payload.topics = tData.topics;
  }

  // Generic Mapping
  if (data.isProfileComplete !== undefined) {
    payload.is_profile_complete = data.isProfileComplete;
    delete payload.isProfileComplete;
  }

  return payload;
};

export const userService = {
  // 1. GET ALL USERS
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users", error);
      // Suppressed global toast to avoid race-condition confusion on UI load
      // toast.error("Could not load users from server"); 
      return [];
    }
  },

  // 2. GET USERS BY ROLE
  getElementsByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`/users/?role=${role}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${role}s`, error);
      return [];
    }
  },

  // 2.5 PUBLIC DIRECTORY (For Home Page Showcase)
  getPublicDirectory: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/public_directory/');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch public directory", error);
      return [];
    }
  },

  // 3. GET SINGLE USER
  getById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await api.get<User>(`/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error("User not found", error);
      return undefined;
    }
  },

  // 4. CREATE USER
  create: async (user: Partial<User>): Promise<any> => {
    try {
      // Use the JSON Helper to ensure consistent flattening!
      // The previous implementation wrongly nested simple fields into 'student_profile',
      // which the backend read_only field ignored.
      const payload = buildUserJsonPayload(user);

      const response = await api.post('/users/', payload);
      return response.data;
    } catch (error) {
      console.error("Create failed", error);
      throw error;
    }
  },

  // 5. UPDATE USER
  update: async (id: string, data: Partial<User> & { avatarFile?: File; resumeFile?: File }): Promise<void> => {
    try {
      const isMultipart = !!data.avatarFile || !!data.resumeFile;
      let payload: any;
      let headers = {};

      if (isMultipart) {
        payload = buildUserFormData(data);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = buildUserJsonPayload(data);
      }

      await api.patch(`/users/${id}/`, payload, { headers });

    } catch (error) {
      console.error("Update failed", error);
      throw error;
    }
  },

  // 6. DELETE USER
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}/`);
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  },
};