/**
 * Machine ID Generator
 *
 * Generates a unique, persistent hardware fingerprint for license binding.
 *
 * Design Goals:
 * - Survives OS reinstalls
 * - Unique per physical machine
 * - Tolerates minor hardware changes (e.g., adding RAM)
 * - Deterministic (same hardware = same ID)
 */

import { createHmac, randomBytes } from 'crypto';
import { execSync } from 'child_process';
import { platform } from 'os';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

// ============================================
// Types
// ============================================

export interface HardwareInfo {
  motherboardSerial: string | null;
  cpuId: string | null;
  biosUuid: string | null;
  diskSerial: string | null;
  macAddress: string | null;
}

export interface MachineIdResult {
  machineId: string;
  hardwareInfo: HardwareInfo;
  fallbackUsed: boolean;
}

// ============================================
// Constants
// ============================================

// Application-specific salt (change this for your app)
const APP_SALT = 'stocker-desktop-v1-2024';

// Minimum number of hardware identifiers required
const MIN_IDENTIFIERS = 2;

// ============================================
// Hardware Collection Functions
// ============================================

/**
 * Execute a command and return trimmed output, or null on error
 */
function execCommand(command: string): string | null {
  try {
    return execSync(command, {
      encoding: 'utf8',
      timeout: 5000,
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Get motherboard serial number
 */
function getMotherboardSerial(): string | null {
  const os = platform();

  if (os === 'win32') {
    const result = execCommand('wmic baseboard get serialnumber');
    if (result) {
      const lines = result.split('\n').filter((l) => l.trim() && l.trim() !== 'SerialNumber');
      if (lines.length > 0 && lines[0].trim() !== 'To be filled by O.E.M.') {
        return lines[0].trim();
      }
    }
  } else if (os === 'linux') {
    const result = execCommand('sudo dmidecode -s baseboard-serial-number 2>/dev/null');
    if (result && result !== 'Not Specified') {
      return result;
    }
  } else if (os === 'darwin') {
    const result = execCommand('ioreg -l | grep IOPlatformSerialNumber');
    if (result) {
      const match = result.match(/"IOPlatformSerialNumber"\s*=\s*"([^"]+)"/);
      if (match) return match[1];
    }
  }

  return null;
}

/**
 * Get CPU ID
 */
function getCpuId(): string | null {
  const os = platform();

  if (os === 'win32') {
    const result = execCommand('wmic cpu get ProcessorId');
    if (result) {
      const lines = result.split('\n').filter((l) => l.trim() && l.trim() !== 'ProcessorId');
      if (lines.length > 0) {
        return lines[0].trim();
      }
    }
  } else if (os === 'linux') {
    // Try cpuid command or /proc/cpuinfo
    const result = execCommand("cat /proc/cpuinfo | grep 'Serial' | head -1 | cut -d':' -f2");
    if (result) return result.trim();

    // Fallback to model name hash
    const model = execCommand("cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d':' -f2");
    if (model) return model.trim();
  } else if (os === 'darwin') {
    const result = execCommand('sysctl -n machdep.cpu.brand_string');
    if (result) return result;
  }

  return null;
}

/**
 * Get BIOS/System UUID
 */
function getBiosUuid(): string | null {
  const os = platform();

  if (os === 'win32') {
    const result = execCommand('wmic csproduct get UUID');
    if (result) {
      const lines = result.split('\n').filter((l) => l.trim() && l.trim() !== 'UUID');
      if (lines.length > 0) {
        const uuid = lines[0].trim();
        // Ignore placeholder UUIDs
        if (uuid !== 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF') {
          return uuid;
        }
      }
    }
  } else if (os === 'linux') {
    const result = execCommand('sudo dmidecode -s system-uuid 2>/dev/null');
    if (result && result !== 'Not Specified') {
      return result;
    }
  } else if (os === 'darwin') {
    const result = execCommand('ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID');
    if (result) {
      const match = result.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
      if (match) return match[1];
    }
  }

  return null;
}

/**
 * Get primary disk serial number
 */
function getDiskSerial(): string | null {
  const os = platform();

  if (os === 'win32') {
    const result = execCommand('wmic diskdrive get SerialNumber');
    if (result) {
      const lines = result.split('\n').filter((l) => l.trim() && l.trim() !== 'SerialNumber');
      if (lines.length > 0) {
        return lines[0].trim();
      }
    }
  } else if (os === 'linux') {
    // Try to get root disk serial
    const result = execCommand('lsblk -no SERIAL /dev/sda 2>/dev/null || lsblk -no SERIAL /dev/nvme0n1 2>/dev/null');
    if (result) return result;
  } else if (os === 'darwin') {
    const result = execCommand('diskutil info disk0 | grep "Media Name"');
    if (result) {
      const parts = result.split(':');
      if (parts.length > 1) return parts[1].trim();
    }
  }

  return null;
}

/**
 * Get primary MAC address
 */
function getMacAddress(): string | null {
  const os = platform();

  if (os === 'win32') {
    const result = execCommand('getmac /v /fo csv');
    if (result) {
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes('Ethernet') || line.includes('Wi-Fi')) {
          const match = line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/);
          if (match) {
            return match[0].replace(/-/g, ':').toUpperCase();
          }
        }
      }
    }
  } else if (os === 'linux') {
    const result = execCommand("ip link show | grep 'link/ether' | head -1 | awk '{print $2}'");
    if (result) return result.toUpperCase();
  } else if (os === 'darwin') {
    const result = execCommand("ifconfig en0 | grep ether | awk '{print $2}'");
    if (result) return result.toUpperCase();
  }

  return null;
}

// ============================================
// Machine ID Generation
// ============================================

/**
 * Collect all hardware information
 */
function collectHardwareInfo(): HardwareInfo {
  return {
    motherboardSerial: getMotherboardSerial(),
    cpuId: getCpuId(),
    biosUuid: getBiosUuid(),
    diskSerial: getDiskSerial(),
    macAddress: getMacAddress(),
  };
}

/**
 * Generate a fallback ID stored locally
 * Used when hardware identifiers are insufficient
 */
function getOrCreateFallbackId(): string {
  const fallbackPath = join(app.getPath('userData'), '.machine-fallback');

  try {
    if (existsSync(fallbackPath)) {
      return readFileSync(fallbackPath, 'utf8').trim();
    }
  } catch {
    // Continue to create new
  }

  // Generate new fallback ID
  const fallbackId = randomBytes(16).toString('hex');

  try {
    const dir = app.getPath('userData');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fallbackPath, fallbackId, { mode: 0o600 });
  } catch {
    // Continue without saving (ID will be different next time)
  }

  return fallbackId;
}

/**
 * Generate the Machine ID from hardware information
 */
export function generateMachineId(): MachineIdResult {
  const hardwareInfo = collectHardwareInfo();

  // Collect non-null identifiers
  const identifiers: string[] = [];

  // Add identifiers with weights (more important ones first)
  if (hardwareInfo.motherboardSerial) {
    identifiers.push(`mb:${hardwareInfo.motherboardSerial}`);
  }
  if (hardwareInfo.cpuId) {
    identifiers.push(`cpu:${hardwareInfo.cpuId}`);
  }
  if (hardwareInfo.biosUuid) {
    identifiers.push(`bios:${hardwareInfo.biosUuid}`);
  }
  if (hardwareInfo.diskSerial) {
    identifiers.push(`disk:${hardwareInfo.diskSerial}`);
  }
  if (hardwareInfo.macAddress) {
    identifiers.push(`mac:${hardwareInfo.macAddress}`);
  }

  let fallbackUsed = false;

  // If we don't have enough identifiers, use fallback
  if (identifiers.length < MIN_IDENTIFIERS) {
    const fallbackId = getOrCreateFallbackId();
    identifiers.push(`fallback:${fallbackId}`);
    fallbackUsed = true;
  }

  // Sort for consistency
  identifiers.sort();

  // Concatenate all identifiers
  const rawFingerprint = identifiers.join('|');

  // Generate HMAC-SHA256 hash
  const hmac = createHmac('sha256', APP_SALT);
  hmac.update(rawFingerprint);
  const hash = hmac.digest('hex');

  // Format as readable Machine ID (uppercase, grouped)
  const machineId = hash.substring(0, 32).toUpperCase();
  const formattedId = `${machineId.substring(0, 8)}-${machineId.substring(8, 16)}-${machineId.substring(16, 24)}-${machineId.substring(24, 32)}`;

  return {
    machineId: formattedId,
    hardwareInfo,
    fallbackUsed,
  };
}

/**
 * Verify that a given Machine ID matches the current machine
 */
export function verifyMachineId(expectedMachineId: string): boolean {
  const { machineId } = generateMachineId();
  return machineId === expectedMachineId;
}

/**
 * Get a short display version of the Machine ID
 * (For showing to users during activation)
 */
export function getMachineIdForDisplay(): string {
  const { machineId } = generateMachineId();
  return machineId;
}

/**
 * Get hardware info for diagnostics
 * (Only show to admin/technician)
 */
export function getHardwareInfoForDiagnostics(): HardwareInfo {
  return collectHardwareInfo();
}
