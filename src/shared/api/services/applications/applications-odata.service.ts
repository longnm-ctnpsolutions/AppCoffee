
import type { Application } from "@/features/applications/types/application.types";
import type { ODataResponse, TableState } from "@/types/odata.types";

const mockApplications: Application[] = [
    { id: '1', identifier: 'app-1', name: 'Ứng dụng Quản lý Nhân sự', description: 'Hệ thống quản lý thông tin nhân viên và chấm công.', logoUrl: '/images/ctnp-logo.png', homePageUrl: '#', callbackUrl: '#' },
    { id: '2', identifier: 'app-2', name: 'Ứng dụng Quản lý Kho', description: 'Theo dõi hàng tồn kho và quản lý xuất nhập hàng.', logoUrl: '/images/ctnp-logo.png', homePageUrl: '#', callbackUrl: '#' },
    { id: '3', identifier: 'app-3', name: 'Hệ thống CRM', description: 'Quản lý quan hệ khách hàng và theo dõi cơ hội kinh doanh.', logoUrl: '/images/ctnp-logo.png', homePageUrl: '#', callbackUrl: '#' },
    { id: '4', identifier: 'app-4', name: 'Cổng thông tin Nội bộ', description: 'Kênh giao tiếp và chia sẻ tài nguyên trong công ty.', logoUrl: '/images/ctnp-logo.png', homePageUrl: '#', callbackUrl: '#' },
    { id: '5', identifier: 'app-5', name: 'Phần mềm Kế toán', description: 'Quản lý thu chi, công nợ và báo cáo tài chính.', logoUrl: '/images/ctnp-logo.png', homePageUrl: '#', callbackUrl: '#' },
];


export interface ApplicationsQueryResult {
    applications: Application[];
    totalCount: number;
    hasMore: boolean;
}

export const getApplicationsWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<ApplicationsQueryResult> => {
    console.log("Mocking getApplicationsWithOData", { tableState, searchTerm });

    return new Promise(resolve => {
        setTimeout(() => {
            let filteredApplications = mockApplications;

            if (searchTerm) {
                const lowercasedFilter = searchTerm.toLowerCase();
                filteredApplications = filteredApplications.filter(app =>
                    app.name?.toLowerCase().includes(lowercasedFilter) ||
                    app.description?.toLowerCase().includes(lowercasedFilter)
                );
            }
            
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedApplications = filteredApplications.slice(start, end);

            resolve({
                applications: paginatedApplications,
                totalCount: filteredApplications.length,
                hasMore: end < filteredApplications.length,
            });
        }, 500); 
    });
};
