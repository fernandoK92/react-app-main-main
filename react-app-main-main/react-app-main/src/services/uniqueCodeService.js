import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'centrosur_unique_codes_v1';

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStorage = (codes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
};

const normalizeCode = (code = '') => code.trim().toUpperCase();

export const getUniqueCodes = () => {
  const codes = readStorage();
  return [...codes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const generateUniqueCode = () => {
  const token = uuidv4().replace(/-/g, '').toUpperCase();
  const formatted = `${token.slice(0, 8)}-${token.slice(8, 12)}`;

  const newCode = {
    id: Date.now(),
    code: formatted,
    createdAt: new Date().toISOString(),
    used: false,
    usedAt: null,
  };

  const current = getUniqueCodes();
  const next = [newCode, ...current];
  writeStorage(next);
  return newCode;
};

export const clearUniqueCodes = () => {
  writeStorage([]);
};

export const markUniqueCodeAsUsed = (codeValue) => {
  const normalized = normalizeCode(codeValue);
  if (!normalized) return { ok: false, reason: 'empty' };

  const current = getUniqueCodes();
  const index = current.findIndex((item) => normalizeCode(item.code) === normalized);

  if (index === -1) return { ok: false, reason: 'not-found' };
  if (current[index].used) return { ok: false, reason: 'already-used' };

  const updated = {
    ...current[index],
    used: true,
    usedAt: new Date().toISOString(),
  };

  const next = [...current];
  next[index] = updated;
  writeStorage(next);

  return { ok: true, code: updated };
};

export const isUniqueCodeAvailable = (codeValue) => {
  const normalized = normalizeCode(codeValue);
  if (!normalized) return false;
  const current = getUniqueCodes();
  const found = current.find((item) => normalizeCode(item.code) === normalized);
  return Boolean(found && !found.used);
};
