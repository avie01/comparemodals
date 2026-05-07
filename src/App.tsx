import { useState } from 'react';
import { DiffModal, DiffModalV1 } from './components/DiffModal';
import type { Version } from './types/diff';

// Deep nested sample data for complex hierarchies
const dataV1: Record<string, unknown> = {
  'Config Management': {
    Settings: {
      'Feature Flags': {
        'Dark Mode': {
          id: 'ff-dark-mode-001',
          enabled: false,
          rolloutPercentage: 0,
          targetAudience: 'internal',
          description: 'Enable dark mode theme',
        },
        'Beta Features': {
          id: 'ff-beta-001',
          enabled: true,
          rolloutPercentage: 25,
          targetAudience: 'beta-testers',
          description: 'Access to beta features',
        },
        'New Dashboard': {
          id: 'ff-dashboard-001',
          enabled: false,
          rolloutPercentage: 0,
          targetAudience: 'all',
          description: 'New dashboard layout',
        },
      },
      'System Preferences': {
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        language: 'en-US',
      },
    },
    'Environment Variables': {
      API_TIMEOUT: 30000,
      MAX_RETRIES: 3,
      LOG_LEVEL: 'info',
    },
  },
  'Record Configuration': {
    'Inspection Domain': {
      'Workflow Events': {
        'On Submit': {
          id: 'wf-submit-001',
          triggerType: 'user-action',
          enabled: true,
          actions: ['validate', 'save'],
          notifyUsers: false,
        },
        'On Approve': {
          id: 'wf-approve-001',
          triggerType: 'user-action',
          enabled: true,
          actions: ['update-status', 'notify'],
          notifyUsers: true,
        },
        'On Reject': {
          id: 'wf-reject-001',
          triggerType: 'user-action',
          enabled: false,
          actions: ['update-status'],
          notifyUsers: false,
        },
      },
      Rules: {
        'Required Fields Rule': {
          id: 'rule-req-001',
          ruleType: 'validation',
          priority: 1,
          condition: 'field.isEmpty()',
          errorMessage: 'This field is required',
          active: true,
        },
        'Date Range Rule': {
          id: 'rule-date-001',
          ruleType: 'validation',
          priority: 2,
          condition: 'startDate <= endDate',
          errorMessage: 'Start date must be before end date',
          active: true,
        },
      },
      Fields: {
        inspectionDate: 'date',
        inspector: 'lookup',
        status: 'picklist',
      },
    },
    'Permit Domain': {
      'Workflow Events': {
        'On Create': {
          id: 'wf-create-002',
          triggerType: 'system',
          enabled: true,
          actions: ['assign-number', 'set-defaults'],
          notifyUsers: false,
        },
      },
      Fields: {
        permitNumber: 'auto-number',
        applicant: 'lookup',
        expirationDate: 'date',
      },
    },
  },
  'User Management': {
    'Roles & Permissions': {
      Administrator: {
        'Domain Permissions': {
          'Inspection Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: true, conditions: null },
            'Approve Records': { granted: true, conditions: null },
            'Export Data': { granted: true, conditions: null },
          },
          'Permit Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: true, conditions: null },
            'Issue Permit': { granted: true, conditions: null },
          },
        },
        'System Permissions': {
          'Manage Users': true,
          'Manage Roles': true,
          'View Audit Log': true,
          'System Settings': true,
        },
      },
      Inspector: {
        'Domain Permissions': {
          'Inspection Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: 'owner === currentUser' },
            Delete: { granted: false, conditions: null },
            'Approve Records': { granted: false, conditions: null },
            'Export Data': { granted: true, conditions: null },
          },
          'Permit Domain': {
            Create: { granted: false, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: false, conditions: null },
            Delete: { granted: false, conditions: null },
            'Issue Permit': { granted: false, conditions: null },
          },
        },
        'System Permissions': {
          'Manage Users': false,
          'Manage Roles': false,
          'View Audit Log': false,
          'System Settings': false,
        },
      },
    },
    'User Groups': {
      'Field Team': {
        members: 12,
        defaultRole: 'Inspector',
      },
      'Office Staff': {
        members: 8,
        defaultRole: 'Reviewer',
      },
    },
  },
};

const dataV2: Record<string, unknown> = {
  'Config Management': {
    Settings: {
      'Feature Flags': {
        'Dark Mode': {
          id: 'ff-dark-mode-001',
          enabled: true, // Changed
          rolloutPercentage: 100, // Changed
          targetAudience: 'all', // Changed
          description: 'Enable dark mode theme',
        },
        'Beta Features': {
          id: 'ff-beta-001',
          enabled: true,
          rolloutPercentage: 50, // Changed
          targetAudience: 'beta-testers',
          description: 'Access to beta features',
        },
        'New Dashboard': {
          id: 'ff-dashboard-001',
          enabled: true, // Changed
          rolloutPercentage: 75, // Changed
          targetAudience: 'internal', // Changed
          description: 'New dashboard layout with analytics',  // Changed
        },
        'AI Assistant': { // New feature flag
          id: 'ff-ai-001',
          enabled: true,
          rolloutPercentage: 10,
          targetAudience: 'internal',
          description: 'AI-powered assistant',
        },
      },
      'System Preferences': {
        timezone: 'America/New_York', // Changed
        dateFormat: 'YYYY-MM-DD', // Changed
        language: 'en-US',
        autoSave: true, // New
      },
    },
    'Environment Variables': {
      API_TIMEOUT: 60000, // Changed
      MAX_RETRIES: 5, // Changed
      LOG_LEVEL: 'debug', // Changed
      CACHE_TTL: 3600, // New
    },
  },
  'Record Configuration': {
    'Inspection Domain': {
      'Workflow Events': {
        'On Submit': {
          id: 'wf-submit-001',
          triggerType: 'user-action',
          enabled: true,
          actions: ['validate', 'save', 'notify-supervisor'], // Changed - added action
          notifyUsers: true, // Changed
        },
        'On Approve': {
          id: 'wf-approve-001',
          triggerType: 'user-action',
          enabled: true,
          actions: ['update-status', 'notify', 'generate-report'], // Changed - added action
          notifyUsers: true,
        },
        'On Reject': {
          id: 'wf-reject-001',
          triggerType: 'user-action',
          enabled: true, // Changed
          actions: ['update-status', 'notify-applicant'], // Changed - added action
          notifyUsers: true, // Changed
        },
        'On Escalate': { // New workflow event
          id: 'wf-escalate-001',
          triggerType: 'system',
          enabled: true,
          actions: ['notify-manager', 'update-priority'],
          notifyUsers: true,
        },
      },
      Rules: {
        'Required Fields Rule': {
          id: 'rule-req-001',
          ruleType: 'validation',
          priority: 1,
          condition: 'field.isEmpty()',
          errorMessage: 'This field is required',
          active: true,
        },
        'Date Range Rule': {
          id: 'rule-date-001',
          ruleType: 'validation',
          priority: 2,
          condition: 'startDate <= endDate',
          errorMessage: 'Invalid date range: Start date must be before end date', // Changed
          active: true,
        },
        'Auto-Assignment Rule': { // New rule
          id: 'rule-assign-001',
          ruleType: 'automation',
          priority: 3,
          condition: 'status === "new"',
          errorMessage: null,
          active: true,
        },
      },
      Fields: {
        inspectionDate: 'date',
        inspector: 'lookup',
        status: 'picklist',
        priority: 'picklist', // New field
        attachments: 'file', // New field
      },
    },
    'Permit Domain': {
      'Workflow Events': {
        'On Create': {
          id: 'wf-create-002',
          triggerType: 'system',
          enabled: true,
          actions: ['assign-number', 'set-defaults', 'send-confirmation'], // Changed
          notifyUsers: true, // Changed
        },
        'On Expire': { // New workflow event
          id: 'wf-expire-002',
          triggerType: 'scheduled',
          enabled: true,
          actions: ['update-status', 'notify-holder'],
          notifyUsers: true,
        },
      },
      Fields: {
        permitNumber: 'auto-number',
        applicant: 'lookup',
        expirationDate: 'date',
        renewalDate: 'date', // New field
      },
    },
  },
  'User Management': {
    'Roles & Permissions': {
      Administrator: {
        'Domain Permissions': {
          'Inspection Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: true, conditions: null },
            'Approve Records': { granted: true, conditions: null },
            'Export Data': { granted: true, conditions: null },
            'Bulk Operations': { granted: true, conditions: null }, // New permission
          },
          'Permit Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: true, conditions: null },
            'Issue Permit': { granted: true, conditions: null },
            'Revoke Permit': { granted: true, conditions: null }, // New permission
          },
        },
        'System Permissions': {
          'Manage Users': true,
          'Manage Roles': true,
          'View Audit Log': true,
          'System Settings': true,
          'API Access': true, // New permission
        },
      },
      Inspector: {
        'Domain Permissions': {
          'Inspection Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null }, // Changed - removed condition
            Delete: { granted: false, conditions: null },
            'Approve Records': { granted: true, conditions: 'priority !== "high"' }, // Changed
            'Export Data': { granted: true, conditions: null },
            'Bulk Operations': { granted: false, conditions: null }, // New permission
          },
          'Permit Domain': {
            Create: { granted: false, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: 'assignedTo === currentUser' }, // Changed
            Delete: { granted: false, conditions: null },
            'Issue Permit': { granted: false, conditions: null },
            'Revoke Permit': { granted: false, conditions: null }, // New permission
          },
        },
        'System Permissions': {
          'Manage Users': false,
          'Manage Roles': false,
          'View Audit Log': true, // Changed
          'System Settings': false,
          'API Access': false, // New permission
        },
      },
      Supervisor: { // New role
        'Domain Permissions': {
          'Inspection Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: true, conditions: 'status === "draft"' },
            'Approve Records': { granted: true, conditions: null },
            'Export Data': { granted: true, conditions: null },
            'Bulk Operations': { granted: true, conditions: null },
          },
          'Permit Domain': {
            Create: { granted: true, conditions: null },
            Read: { granted: true, conditions: null },
            Update: { granted: true, conditions: null },
            Delete: { granted: false, conditions: null },
            'Issue Permit': { granted: true, conditions: null },
            'Revoke Permit': { granted: false, conditions: null },
          },
        },
        'System Permissions': {
          'Manage Users': true,
          'Manage Roles': false,
          'View Audit Log': true,
          'System Settings': false,
          'API Access': true,
        },
      },
    },
    'User Groups': {
      'Field Team': {
        members: 15, // Changed
        defaultRole: 'Inspector',
        supervisor: 'John Smith', // New
      },
      'Office Staff': {
        members: 10, // Changed
        defaultRole: 'Reviewer',
        supervisor: 'Jane Doe', // New
      },
      'Management': { // New group
        members: 3,
        defaultRole: 'Supervisor',
        supervisor: null,
      },
    },
  },
};

// Sample versions for version selector
const sampleVersions: Version[] = [
  {
    id: '4DEC27AB-0201-42D1-BF40-5D6E2DE435AC',
    label: 'Version 2.0.0',
    timestamp: new Date('2024-01-15T16:18:00'),
    author: 'John Smith',
    data: dataV2,
  },
  {
    id: '3BCD16AB-0101-31C0-AE30-4C5D1CD324AB',
    label: 'Version 1.0.0',
    timestamp: new Date('2024-01-10T14:30:00'),
    author: 'Jane Doe',
    data: dataV1,
  },
];

function App() {
  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  const [v1ModalOpen, setV1ModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Diff comparison modal
        </h1>
        <p className="text-gray-600 mb-8">
          A reusable React component for viewing hierarchical differences between
          versions or configurations.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
          {/* Checkpoint Comparison Card */}
          <div className="bg-white rounded-[2px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Checkpoint comparison
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Compare versions with a version selector. Supports "View summary" mode
              to compare to the preceding version.
            </p>
            <button
              onClick={() => setCheckpointModalOpen(true)}
              className="w-full px-4 py-2 bg-[#3560C1] text-white rounded-[2px] font-medium hover:bg-[#2a4fa3] transition-colors"
            >
              View checkpoint changes
            </button>
          </div>

          {/* Config Import Card */}
          <div className="bg-white rounded-[2px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Config import preview
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Preview changes when importing a configuration file. Shows what will
              change if you proceed with the import.
            </p>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="w-full px-4 py-2 bg-[#3560C1] text-white rounded-[2px] font-medium hover:bg-[#2a4fa3] transition-colors"
            >
              Preview import changes
            </button>
          </div>

          {/* Simple Comparison Card */}
          <div className="bg-white rounded-[2px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Direct data comparison
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Compare any two objects directly without version management. Useful
              for ad-hoc comparisons.
            </p>
            <button
              onClick={() => setSimpleModalOpen(true)}
              className="w-full px-4 py-2 bg-[#3560C1] text-white rounded-[2px] font-medium hover:bg-[#2a4fa3] transition-colors"
            >
              Compare objects
            </button>
          </div>

          {/* V1 Simplified Modal Card */}
          <div className="bg-white rounded-[2px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              V1 Simplified view
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Simplified modal with single value column, no change indicators,
              and no colored styling.
            </p>
            <button
              onClick={() => setV1ModalOpen(true)}
              className="w-full px-4 py-2 bg-[#3560C1] text-white rounded-[2px] font-medium hover:bg-[#2a4fa3] transition-colors"
            >
              View simplified modal
            </button>
          </div>
        </div>

      </div>

      {/* Checkpoint Comparison Modal */}
      <DiffModal
        isOpen={checkpointModalOpen}
        onClose={() => setCheckpointModalOpen(false)}
        title="'Inspection' Record Type Updated"
        versions={sampleVersions}
        fromLabel="From Value"
        toLabel="To Value"
        onRollback={(versionId) => {
          alert(`Rolling back to version: ${versionId}`);
          setCheckpointModalOpen(false);
        }}
        rollbackLabel="Rollback to this version"
      />

      {/* Config Import Modal */}
      <DiffModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Import Preview"
        subtitle="Review changes before importing configuration"
        fromData={dataV1}
        toData={dataV2}
        fromLabel="Current Config"
        toLabel="Imported Config"
      />

      {/* Simple Comparison Modal */}
      <DiffModal
        isOpen={simpleModalOpen}
        onClose={() => setSimpleModalOpen(false)}
        title="Configuration Changes"
        subtitle="Comparing configuration versions"
        fromData={dataV1}
        toData={dataV2}
        fromLabel="Before"
        toLabel="After"
      />

      {/* V1 Simplified Modal */}
      <DiffModalV1
        isOpen={v1ModalOpen}
        onClose={() => setV1ModalOpen(false)}
        title="System Configuration Updated"
        subtitle="Review changes to configuration, records, and permissions"
        fromData={dataV1}
        toData={dataV2}
        valueLabel="Value"
      />
    </div>
  );
}

export default App;
