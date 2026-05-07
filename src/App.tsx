import { useState } from 'react';
import { DiffModal, DiffModalV1 } from './components/DiffModal';
import type { Version } from './types/diff';

// Sample data matching the screenshot structure
const checkpointV1: Record<string, unknown> = {
  'User Information Tab': {
    description: 'Example domain description',
    'Home Address Section': {
      'Phone Number Field': {
        id: 'asdh5f-dsa21-pkj8sa-dasj31-dsa231d',
        mandatoryFlag: false,
        displayOrder: 3,
      },
      sectionName: 'Address Info',
      editable: false,
    },
  },
  'Submit Form Workflow Transition': {
    name: null,
    usedInRules: false,
  },
  metadata: {
    version: '10.2.10.62',
    recordType: 'Inspection',
  },
};

const checkpointV2: Record<string, unknown> = {
  'User Information Tab': {
    description: 'Updated domain description',
    'Home Address Section': {
      'Phone Number Field': {
        id: 'asdh5f-dsa21-pkj8sa-dasj31-dsa231d',
        mandatoryFlag: true, // Changed from false to true
        displayOrder: 4, // Changed from 3 to 4
      },
      sectionName: 'Home Address Section', // Changed from 'Address Info'
      editable: true, // Changed from false to true
    },
  },
  'Submit Form Workflow Transition': {
    name: 'Submit Form Workflow Transition', // Added
    usedInRules: true, // Changed from false to true
  },
  metadata: {
    version: '10.2.10.63',
    recordType: 'Inspection',
  },
  auditLog: {
    // New section
    enabled: true,
    retentionDays: 90,
  },
};

// More complex sample for config import/export
const currentConfig: Record<string, unknown> = {
  authentication: {
    provider: 'oauth2',
    timeout: 3600,
    allowedDomains: ['example.com', 'corp.example.com'],
  },
  notifications: {
    email: {
      enabled: true,
      recipients: ['admin@example.com'],
    },
    slack: {
      enabled: false,
    },
  },
  features: {
    darkMode: false,
    betaFeatures: ['featureA', 'featureB'],
  },
};

const importedConfig: Record<string, unknown> = {
  authentication: {
    provider: 'oauth2',
    timeout: 7200, // Changed
    allowedDomains: ['example.com', 'corp.example.com', 'partner.example.com'], // Added
    mfa: {
      // New section
      required: true,
      methods: ['totp', 'sms'],
    },
  },
  notifications: {
    email: {
      enabled: true,
      recipients: ['admin@example.com', 'security@example.com'], // Added
    },
    slack: {
      enabled: true, // Changed
      channel: '#alerts', // Added
    },
    webhook: {
      // New section
      url: 'https://hooks.example.com/notify',
      events: ['error', 'warning'],
    },
  },
  features: {
    darkMode: true, // Changed
    betaFeatures: ['featureA', 'featureC'], // featureB removed, featureC added
  },
  audit: {
    // New section
    enabled: true,
    retentionDays: 90,
  },
};

// Sample versions for version selector
const sampleVersions: Version[] = [
  {
    id: '4DEC27AB-0201-42D1-BF40-5D6E2DE435AC',
    label: 'Version 10.2.10.63',
    timestamp: new Date('2023-05-19T16:18:00'),
    author: 'John Smith',
    data: checkpointV2,
  },
  {
    id: '3BCD16AB-0101-31C0-AE30-4C5D1CD324AB',
    label: 'Version 10.2.10.62',
    timestamp: new Date('2023-05-18T14:30:00'),
    author: 'Jane Doe',
    data: checkpointV1,
  },
  {
    id: '2ABC05AB-0001-20B0-9D20-3B4C0BC213AB',
    label: 'Version 10.2.10.61',
    timestamp: new Date('2023-05-15T09:15:00'),
    author: 'Bob Wilson',
    data: {
      ...checkpointV1,
      metadata: { version: '10.2.10.61', recordType: 'Inspection' },
    },
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
        fromData={currentConfig}
        toData={importedConfig}
        fromLabel="Current Config"
        toLabel="Imported Config"
      />

      {/* Simple Comparison Modal */}
      <DiffModal
        isOpen={simpleModalOpen}
        onClose={() => setSimpleModalOpen(false)}
        title="Object Comparison"
        subtitle="Comparing two data objects"
        fromData={checkpointV1}
        toData={checkpointV2}
        fromLabel="Before"
        toLabel="After"
      />

      {/* V1 Simplified Modal */}
      <DiffModalV1
        isOpen={v1ModalOpen}
        onClose={() => setV1ModalOpen(false)}
        title="'Inspection' Record Type Updated"
        subtitle="Simplified view - single value column"
        fromData={checkpointV1}
        toData={checkpointV2}
        valueLabel="Value"
        onConfirm={() => {
          alert('Changes confirmed!');
          setV1ModalOpen(false);
        }}
        confirmLabel="Confirm"
      />
    </div>
  );
}

export default App;
