
import type { Client, Permission } from "@/features/clients/types/client.types";

export const permissions: Permission[] = [
  { permission: "read:user", description: "Đọc hồ sơ người dùng" },
  { permission: "write:user", description: "Cập nhật hồ sơ người dùng" },
  { permission: "delete:user", description: "Xóa tài khoản người dùng" },
  { permission: "read:settings", description: "Xem cài đặt" },
  { permission: "update:settings", description: "Thay đổi cài đặt" },
  { permission: "admin:all", description: "Toàn quyền quản trị" },
];

export const clients: Client[] = [
  { 
    id: 'client-1', 
    name: 'Activation', 
    clientId: 'a1b2c3d4e5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Quản lý và theo dõi việc kích hoạt các hệ thống, dịch vụ hoặc sản phẩm với sự hỗ trợ cho các yêu cầu, phê duyệt và giám sát trạng thái.'
  },
  { 
    id: 'client-2', 
    name: 'ClaimTire', 
    clientId: 'f6g7h8i9j0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Hỗ trợ việc gửi, theo dõi và quản lý giải quyết các khiếu nại liên quan đến lốp xe.'
  },
  { 
    id: 'client-3', 
    name: 'Fleet Approach', 
    clientId: 'k1l2m3n4o5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Cho phép vận hành tinh gọn và cung cấp thông tin chi tiết cho các hoạt động và dịch vụ liên quan đến đội xe.'
  },
  { 
    id: 'client-4', 
    name: 'Portal Identity', 
    clientId: 'p6q7r8s9t0', 
    status: 0,
    logo: '/images/new-icon.png',
    description: 'Một ứng dụng tập trung để quản lý danh tính người dùng, vai trò, quyền và cấu hình máy khách trên các hệ thống tích hợp.'
  },
  { 
    id: 'client-5', 
    name: 'Web Order for Dealer', 
    clientId: 'u1v2w3x4y5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Đặt, theo dõi và quản lý đơn hàng thông qua hệ thống đặt hàng trực tuyến tích hợp.'
  },
  { 
    id: 'client-6', 
    name: 'SystemSync', 
    clientId: 'z1a2b3c4d5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Đồng bộ hóa dữ liệu và hoạt động trên nhiều hệ thống để tích hợp liền mạch.'
  },
  { 
    id: 'client-7', 
    name: 'TrackMate', 
    clientId: 'e6f7g8h9i0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Theo dõi và giám sát thời gian thực cho tài sản, lô hàng hoặc dịch vụ.'
  },
  { 
    id: 'client-8', 
    name: 'OrderFlow', 
    clientId: 'j1k2l3m4n5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Hợp lý hóa quy trình xử lý đơn hàng với các quy trình làm việc tự động và cập nhật trạng thái.'
  },
  { 
    id: 'client-9', 
    name: 'UserHub', 
    clientId: 'o6p7q8r9s0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Nền tảng tập trung để quản lý người dùng, xác thực và kiểm soát truy cập.'
  },
  { 
    id: 'client-10', 
    name: 'InsightCore', 
    clientId: 't1u2v3w4x5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Phân tích và báo cáo nâng cao cho thông tin chi tiết về hoạt động và kinh doanh.'
  },
  { 
    id: 'client-11', 
    name: 'ClaimPro', 
    clientId: 'y6z7a8b9c0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Xử lý khiếu nại hiệu quả với xác thực và theo dõi tự động.'
  },
  { 
    id: 'client-12', 
    name: 'FleetSync', 
    clientId: 'd1e2f3g4h5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Quản lý đội xe tích hợp với đồng bộ hóa dữ liệu thời gian thực.'
  },
  { 
    id: 'client-13', 
    name: 'ServicePoint', 
    clientId: 'i6j7k8l9m0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Quản lý các yêu cầu dịch vụ, lên lịch và các hoạt động hỗ trợ khách hàng.'
  },
  { 
    id: 'client-14', 
    name: 'OrderTrack', 
    clientId: 'n1o2p3q4r5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Theo dõi đơn hàng từ khi đặt đến khi giao với cập nhật thời gian thực.'
  },
  { 
    id: 'client-15', 
    name: 'IdentitySync', 
    clientId: 's6t7u8v9w0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Đồng bộ hóa danh tính và quyền của người dùng trên nhiều nền tảng.'
  },
  { 
    id: 'client-16', 
    name: 'DataBridge', 
    clientId: 'x1y2z3a4b5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Kết nối và truyền dữ liệu giữa các hệ thống khác nhau một cách an toàn.'
  },
  { 
    id: 'client-17', 
    name: 'ClaimEase', 
    clientId: 'c6d7e8f9g0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Đơn giản hóa việc gửi khiếu nại với giao diện thân thiện và tự động hóa.'
  },
  { 
    id: 'client-18', 
    name: 'FleetInsight', 
    clientId: 'i1j2k3l4m5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Cung cấp thông tin chi tiết hữu ích cho các hoạt động và bảo trì đội xe.'
  },
  { 
    id: 'client-19', 
    name: 'PortalSync', 
    clientId: 'n6o7p8q9r0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Đồng bộ hóa cấu hình cổng và dữ liệu người dùng trên các hệ thống tích hợp.'
  },
  { 
    id: 'client-20', 
    name: 'OrderPro', 
    clientId: 's1t2u3v4w5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Quản lý đơn hàng nâng cao với các quy trình làm việc và báo cáo có thể tùy chỉnh.'
  },
];
