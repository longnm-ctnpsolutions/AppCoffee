
import type { Files } from "@/features/clients/types/files.types";

export const uploadFile = async (fileData: Files): Promise<any> => {
    console.log("Mocking uploadFile", fileData.file.name);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                name: fileData.file.name,
                url: URL.createObjectURL(fileData.file), // Tạo URL tạm thời để preview
                size: fileData.file.size
            });
        }, 1000);
    });
};
