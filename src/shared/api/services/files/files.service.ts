import type { Files } from "@/features/clients/types/files.types";
import { handleResponse } from '@/lib/response-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const uploadFile = async (fileData: Files): Promise<any> => {
    const formData = new FormData();
    formData.append("container", fileData.container);
    formData.append("userId", fileData.userId);
    formData.append("file", fileData.file);

    const response = await fetch(`${API_BASE_URL}/files`, {
        method: "POST",
        credentials: "include",
        body: formData, // không set Content-Type, browser tự thêm
    });

    return await handleResponse<any>(response);
};