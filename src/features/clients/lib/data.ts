
import type { Client, Permission } from "@/features/clients/types/client.types";

export const permissions: Permission[] = [
  { permission: "read:user", description: "Read user profile" },
  { permission: "write:user", description: "Update user profile" },
  { permission: "delete:user", description: "Delete user account" },
  { permission: "read:settings", description: "View settings" },
  { permission: "update:settings", description: "Change settings" },
  { permission: "admin:all", description: "Full admin access" },
];

export const clients: Client[] = [
  { 
    id: 'client-1', 
    name: 'Activation', 
    clientId: 'a1b2c3d4e5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Manage and track the activation of systems, services, or products with support for requests, approvals, and status monitoring.'
  },
  { 
    id: 'client-2', 
    name: 'ClaimTire', 
    clientId: 'f6g7h8i9j0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Support tire-related claim submissions, tracking, and resolution management.'
  },
  { 
    id: 'client-3', 
    name: 'Fleet Approach', 
    clientId: 'k1l2m3n4o5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Enable streamlined operations and insights for fleet-related activities and services.'
  },
  { 
    id: 'client-4', 
    name: 'Portal Identity', 
    clientId: 'p6q7r8s9t0', 
    status: 0,
    logo: '/images/new-icon.png',
    description: 'A centralized application for managing user identities, roles, permissions, and client configurations across integrated systems.'
  },
  { 
    id: 'client-5', 
    name: 'Web Order for Dealer', 
    clientId: 'u1v2w3x4y5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Place, track, and manage orders through the integrated online ordering system.'
  },
  { 
    id: 'client-6', 
    name: 'SystemSync', 
    clientId: 'z1a2b3c4d5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Synchronize data and operations across multiple systems for seamless integration.'
  },
  { 
    id: 'client-7', 
    name: 'TrackMate', 
    clientId: 'e6f7g8h9i0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Real-time tracking and monitoring for assets, shipments, or services.'
  },
  { 
    id: 'client-8', 
    name: 'OrderFlow', 
    clientId: 'j1k2l3m4n5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Streamline order processing with automated workflows and status updates.'
  },
  { 
    id: 'client-9', 
    name: 'UserHub', 
    clientId: 'o6p7q8r9s0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Centralized platform for user management, authentication, and access control.'
  },
  { 
    id: 'client-10', 
    name: 'InsightCore', 
    clientId: 't1u2v3w4x5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Advanced analytics and reporting for operational and business insights.'
  },
  { 
    id: 'client-11', 
    name: 'ClaimPro', 
    clientId: 'y6z7a8b9c0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Efficient claim processing with automated validation and tracking.'
  },
  { 
    id: 'client-12', 
    name: 'FleetSync', 
    clientId: 'd1e2f3g4h5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Integrated fleet management with real-time data synchronization.'
  },
  { 
    id: 'client-13', 
    name: 'ServicePoint', 
    clientId: 'i6j7k8l9m0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Manage service requests, scheduling, and customer support operations.'
  },
  { 
    id: 'client-14', 
    name: 'OrderTrack', 
    clientId: 'n1o2p3q4r5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Track orders from placement to delivery with real-time updates.'
  },
  { 
    id: 'client-15', 
    name: 'IdentitySync', 
    clientId: 's6t7u8v9w0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Synchronize user identities and permissions across multiple platforms.'
  },
  { 
    id: 'client-16', 
    name: 'DataBridge', 
    clientId: 'x1y2z3a4b5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Connect and transfer data between disparate systems securely.'
  },
  { 
    id: 'client-17', 
    name: 'ClaimEase', 
    clientId: 'c6d7e8f9g0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Simplify claim submissions with user-friendly interfaces and automation.'
  },
  { 
    id: 'client-18', 
    name: 'FleetInsight', 
    clientId: 'i1j2k3l4m5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Provide actionable insights for fleet operations and maintenance.'
  },
  { 
    id: 'client-19', 
    name: 'PortalSync', 
    clientId: 'n6o7p8q9r0', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Sync portal configurations and user data across integrated systems.'
  },
  { 
    id: 'client-20', 
    name: 'OrderPro', 
    clientId: 's1t2u3v4w5', 
    status: 1,
    logo: '/images/new-icon.png',
    description: 'Advanced order management with customizable workflows and reporting.'
  },
];
