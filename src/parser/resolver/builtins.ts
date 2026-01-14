export type IntentCategory = 'QUERY' | 'CONTROL' | 'UI' | 'STATE' | 'AUTH' | 'DEVICE' | 'EXEC';

export type Backend = 'html' | 'python' | 'shell' | 'ncom';

export interface IntentBackend {
  html?: (params: Record<string, any>) => string;
  python?: (params: Record<string, any>) => string;
  shell?: (params: Record<string, any>) => string;
  ncom?: (params: Record<string, any>) => string;
}

export interface Intent {
  name: string;
  command: string;
  category: IntentCategory;
  requiredParams: string[];
  optionalParams: string[];
  backends: IntentBackend;
  description: string;
  examples: string[];
}

export const BUILTIN_INTENTS: Record<string, Intent> = {
  'device.sniff': {
    name: 'device.sniff',
    command: 'Sniff~',
    category: 'DEVICE',
    requiredParams: [],
    optionalParams: ['scope', 'target'],
    backends: {
      shell: (params) => `sniff ${params.scope || 'ALL'} ${params.target ? `--target ${params.target}` : ''}`,
      html: (params) => `<button class="plexcode-sniff" data-scope="${params.scope || 'ALL'}">Sniff Devices</button>`,
      ncom: (params) => `NCOM_SNIFF[${params.scope || 'ALL'}]`
    },
    description: 'Detect and enumerate nearby devices or sensors',
    examples: ['Sniff~ [ALL]', 'Sniff~ device | ID~!!']
  },

  'device.detect': {
    name: 'device.detect',
    command: 'detect~!!',
    category: 'DEVICE',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      shell: (params) => `detect-sensors ${params.target}`,
      ncom: (params) => `NCOM_DETECT[${params.target}]`
    },
    description: 'Detect specific device or sensor type',
    examples: ['detect~!! | sensors', 'detect~!! | UWB']
  },

  'device.fetch': {
    name: 'device.fetch',
    command: 'Fetch~!!',
    category: 'DEVICE',
    requiredParams: ['target'],
    optionalParams: ['scope'],
    backends: {
      shell: (params) => `fetch-firmware ${params.target} ${params.scope || ''}`,
      ncom: (params) => `NCOM_FETCH[${params.target}]`
    },
    description: 'Fetch device firmware or data',
    examples: ['Fetch~!! needed firmware [sensors]', 'Fetch~!! device data']
  },

  'device.pair': {
    name: 'device.pair',
    command: 'Pair~',
    category: 'DEVICE',
    requiredParams: [],
    optionalParams: ['device'],
    backends: {
      shell: (params) => `pair-device ${params.device || ''}`,
      ncom: (params) => `NCOM_PAIR[${params.device || 'AUTO'}]`
    },
    description: 'Pair with a device',
    examples: ['Pair~ | Device~!!']
  },

  'device.sense': {
    name: 'device.sense',
    command: 'Sense~!!',
    category: 'DEVICE',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      shell: (params) => `sense ${params.target}`,
      ncom: (params) => `NCOM_SENSE[${params.target}]`
    },
    description: 'Read sensor data from device',
    examples: ['Sense~!! | device [UWB| actions~!!]']
  },

  'state.store': {
    name: 'state.store',
    command: 'Store~',
    category: 'STATE',
    requiredParams: ['ref'],
    optionalParams: [],
    backends: {
      shell: (params) => `store ${params.ref}`,
      python: (params) => `store("${params.ref}")`
    },
    description: 'Store data or state reference',
    examples: ['Store~ @.attributes', 'Store~ @pair']
  },

  'ui.build': {
    name: 'ui.build',
    command: 'Build~',
    category: 'UI',
    requiredParams: [],
    optionalParams: ['target', 'params'],
    backends: {
      html: (params) => `<div class="plexcode-builder" data-target="${params.target || 'default'}"></div>`,
      shell: (params) => `build-ui ${params.target || ''}`
    },
    description: 'Build UI component',
    examples: ['Build~!! UI', 'Build~ panel']
  },

  'ui.panel': {
    name: 'ui.panel',
    command: 'Panel~!!',
    category: 'UI',
    requiredParams: [],
    optionalParams: ['id', 'feed', 'source', 'controls', 'permissions'],
    backends: {
      html: (params) => generatePanel(params),
      shell: (params) => `create-panel ${params.id || 'default'}`
    },
    description: 'Create UI panel with configuration',
    examples: ['Panel~!! | ID~ "MyPanel"', 'Panel~!! | Feed~ LIVE']
  },

  'ui.panels': {
    name: 'ui.panels',
    command: 'Panels~',
    category: 'UI',
    requiredParams: [],
    optionalParams: ['layout'],
    backends: {
      html: (params) => `<div class="plexcode-panels" data-layout="${params.layout || 'grid'}"></div>`
    },
    description: 'Define panels container',
    examples: ['Panels~', 'Panels~ | Grid~']
  },

  'ui.grid': {
    name: 'ui.grid',
    command: 'Grid~',
    category: 'UI',
    requiredParams: [],
    optionalParams: ['rows', 'columns'],
    backends: {
      html: (params) => `<div class="grid" style="grid-template-rows: ${params.rows || 'auto'}; grid-template-columns: ${params.columns || 'auto'};"></div>`
    },
    description: 'Define grid layout',
    examples: ['Grid~ | Rows~ 3 | Columns~ 8']
  },

  'ui.show': {
    name: 'ui.show',
    command: 'Show~',
    category: 'UI',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      html: (params) => `<div class="show-${params.target}">${params.target}</div>`,
      shell: (params) => `show ${params.target}`
    },
    description: 'Display content or data',
    examples: ['Show~ data', 'Show~ hero card']
  },

  'auth.ask': {
    name: 'auth.ask',
    command: 'ASK~!!',
    category: 'AUTH',
    requiredParams: ['permission'],
    optionalParams: [],
    backends: {
      html: (params) => generatePermissionPrompt(params),
      shell: (params) => `request-permission ${params.permission}`
    },
    description: 'Request user permission',
    examples: ['ASK~!! | ACCESS', 'ASK~!! | SENSOR_ACCESS']
  },

  'auth.access': {
    name: 'auth.access',
    command: 'ACCESS~!!',
    category: 'AUTH',
    requiredParams: ['resource'],
    optionalParams: [],
    backends: {
      shell: (params) => `grant-access ${params.resource}`,
      ncom: (params) => `NCOM_ACCESS[${params.resource}]`
    },
    description: 'Grant or check access to resource',
    examples: ['ACCESS~!! | DEVICE', 'ACCESS~ $ | Fetch~!!']
  },

  'exec.call': {
    name: 'exec.call',
    command: 'call~',
    category: 'EXEC',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      shell: (params) => `call ${params.target}`,
      ncom: (params) => `NCOM_CALL[${params.target}]`
    },
    description: 'Call function or command',
    examples: ['call~ [token]', 'call~ device.action']
  },

  'exec.send': {
    name: 'exec.send',
    command: 'SEND~!!',
    category: 'EXEC',
    requiredParams: ['target', 'data'],
    optionalParams: [],
    backends: {
      shell: (params) => `send ${params.data} to ${params.target}`,
      ncom: (params) => `NCOM_SEND[${params.target},${params.data}]`
    },
    description: 'Send data to target',
    examples: ['SEND~!! | device | data', 'send~ APP [ouija board.kit]']
  },

  'exec.get': {
    name: 'exec.get',
    command: 'get~',
    category: 'EXEC',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      shell: (params) => `get ${params.target}`,
      ncom: (params) => `NCOM_GET[${params.target}]`
    },
    description: 'Get data from source',
    examples: ['get~ Device~ ID', 'Get~ sensor data']
  },

  'core.simcore': {
    name: 'core.simcore',
    command: 'SimCore~!!',
    category: 'CONTROL',
    requiredParams: [],
    optionalParams: ['action', 'target'],
    backends: {
      shell: (params) => `simcore ${params.action || ''} ${params.target || ''}`,
      ncom: (params) => `SIMCORE[${params.action || 'RUN'}]`
    },
    description: 'Simulation core control',
    examples: ['SimCore~!! | Inject~ sensor', 'SimCore~!! | Override~ firmware']
  },

  'core.ncom': {
    name: 'core.ncom',
    command: 'NCOM~!!',
    category: 'CONTROL',
    requiredParams: ['action'],
    optionalParams: [],
    backends: {
      ncom: (params) => `NCOM_CORE[${params.action}]`,
      shell: (params) => `ncom ${params.action}`
    },
    description: 'NCOM core command',
    examples: ['NCOM~!! DEV | device', 'NCOM~ system call']
  },

  'config.feed': {
    name: 'config.feed',
    command: 'Feed~',
    category: 'STATE',
    requiredParams: ['mode'],
    optionalParams: [],
    backends: {
      shell: (params) => `set-feed ${params.mode}`
    },
    description: 'Configure data feed',
    examples: ['Feed~ LIVE', 'Feed~ CACHED']
  },

  'config.source': {
    name: 'config.source',
    command: 'Source~',
    category: 'STATE',
    requiredParams: ['target'],
    optionalParams: [],
    backends: {
      shell: (params) => `set-source ${params.target}`
    },
    description: 'Set data source',
    examples: ['Source~ sensor.eye', 'Source~ device.primary']
  },

  'config.permissions': {
    name: 'config.permissions',
    command: 'Permissions~',
    category: 'AUTH',
    requiredParams: ['level'],
    optionalParams: [],
    backends: {
      shell: (params) => `set-permissions ${params.level}`
    },
    description: 'Set permission level',
    examples: ['Permissions~ DEV~!!', 'Permissions~ USER']
  },

  'config.log': {
    name: 'config.log',
    command: 'Log~',
    category: 'STATE',
    requiredParams: ['mode'],
    optionalParams: [],
    backends: {
      shell: (params) => `set-logging ${params.mode}`
    },
    description: 'Configure logging',
    examples: ['Log~ ALWAYS', 'Log~ DEBUG']
  },
};

function generatePanel(params: Record<string, any>): string {
  const id = params.id || 'panel-' + Math.random().toString(36).substr(2, 9);
  const feed = params.feed || 'STATIC';
  const source = params.source || 'default';
  
  return `<div class="plexcode-panel" id="${id}" data-feed="${feed}" data-source="${source}">
  <div class="panel-header">${id}</div>
  <div class="panel-content"></div>
</div>`;
}

function generatePermissionPrompt(params: Record<string, any>): string {
  const permission = params.permission || 'UNKNOWN';
  
  return `<div class="permission-prompt">
  <p>App requests: ${permission}</p>
  <button onclick="grantPermission('${permission}')">Allow</button>
  <button onclick="denyPermission('${permission}')">Deny</button>
</div>`;
}
