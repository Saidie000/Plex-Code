export interface Package {
  name: string;
  version: string;
  source: string;
  type: 'k!t' | 'plx' | 'mf';
  dependencies?: string[];
  description?: string;
}

export interface PackageRegistry {
  [key: string]: Package;
}

export const KNOWN_PACKAGES: PackageRegistry = {
  'blender': {
    name: 'blender',
    version: '1.0.0',
    source: 'blender.org/NCOM',
    type: 'k!t',
    description: 'Blender 3D modeling and animation software'
  },
  'photoshop': {
    name: 'photoshop',
    version: '1.0.0',
    source: 'adobe.com/NCOM',
    type: 'k!t',
    description: 'Adobe Photoshop image editing software'
  },
  'vscode': {
    name: 'vscode',
    version: '1.0.0',
    source: 'code.visualstudio.com/NCOM',
    type: 'k!t',
    description: 'Visual Studio Code editor'
  },
  'chrome': {
    name: 'chrome',
    version: '1.0.0',
    source: 'google.com/NCOM',
    type: 'k!t',
    description: 'Google Chrome web browser'
  },
  'unity': {
    name: 'unity',
    version: '1.0.0',
    source: 'unity.com/NCOM',
    type: 'k!t',
    description: 'Unity game engine'
  },
  'unreal': {
    name: 'unreal',
    version: '1.0.0',
    source: 'unrealengine.com/NCOM',
    type: 'k!t',
    description: 'Unreal Engine game engine'
  }
};

export interface InstallationProgress {
  status: 'checking' | 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export class PackageManager {
  private installedPackages: Set<string>;
  private registry: PackageRegistry;

  constructor(registry: PackageRegistry = KNOWN_PACKAGES) {
    this.installedPackages = new Set();
    this.registry = registry;
  }

  isPackageInstalled(packageName: string): boolean {
    return this.installedPackages.has(packageName.toLowerCase());
  }

  isPackageAvailable(packageName: string): boolean {
    return packageName.toLowerCase() in this.registry;
  }

  getPackageInfo(packageName: string): Package | null {
    return this.registry[packageName.toLowerCase()] || null;
  }

  async checkPackage(packageName: string): Promise<{
    exists: boolean;
    installed: boolean;
    available: boolean;
    package?: Package;
  }> {
    const name = packageName.toLowerCase();
    const installed = this.isPackageInstalled(name);
    const available = this.isPackageAvailable(name);
    const pkg = this.getPackageInfo(name);

    return {
      exists: installed || available,
      installed,
      available,
      package: pkg || undefined
    };
  }

  generateInstallPrompt(packageName: string): string {
    const pkg = this.getPackageInfo(packageName);
    
    if (!pkg) {
      return `|| !! ${packageName} doesn't exist in the package registry.`;
    }

    return `|| !! ${pkg.name} doesn't exist. Would you like me to install ${pkg.name}.k!t onto your system? [ Y ] [ N ]`;
  }

  async installPackage(packageName: string, onProgress?: (progress: InstallationProgress) => void): Promise<boolean> {
    const pkg = this.getPackageInfo(packageName);
    
    if (!pkg) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: 'Package not found in registry'
      });
      return false;
    }

    const steps = [
      { status: 'checking' as const, progress: 10, message: 'Checking dependencies...' },
      { status: 'downloading' as const, progress: 30, message: `Downloading from ${pkg.source}...` },
      { status: 'downloading' as const, progress: 60, message: 'Extracting files...' },
      { status: 'installing' as const, progress: 80, message: 'Installing package...' },
      { status: 'installing' as const, progress: 95, message: 'Configuring system...' },
      { status: 'complete' as const, progress: 100, message: 'Installation complete!' }
    ];

    for (const step of steps) {
      onProgress?.(step);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.installedPackages.add(packageName.toLowerCase());
    return true;
  }

  generateInstallOutput(packageName: string, confirmed: boolean = true): string {
    const pkg = this.getPackageInfo(packageName);
    
    if (!pkg) {
      return `|| !! ${packageName} doesn't exist in the package registry.`;
    }

    if (!confirmed) {
      return `|| Installation cancelled.`;
    }

    const progressBar = '|████████████████████████████████████████|';
    
    return `|| Y
|| Now installing ${pkg.name}.k!t from ${pkg.source}
|| ${progressBar} 100%
|| ✓ ${pkg.name} installed successfully!`;
  }

  markAsInstalled(packageName: string): void {
    this.installedPackages.add(packageName.toLowerCase());
  }

  getAllPackages(): Package[] {
    return Object.values(this.registry);
  }

  addPackageToRegistry(pkg: Package): void {
    this.registry[pkg.name.toLowerCase()] = pkg;
  }
}

export const globalPackageManager = new PackageManager();
