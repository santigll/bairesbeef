import { promises as fs } from "fs";
import path from "path";
import type { Category, Product, Settings } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(process.cwd(), "data-seed");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const PRODUCTS_SEED = path.join(SEED_DIR, "products.json");
const CATEGORIES_SEED = path.join(SEED_DIR, "categories.json");
const SETTINGS_SEED = path.join(SEED_DIR, "settings.json");

// Simple in-process write queue so concurrent admin edits don't clobber
// each other when read-modify-write races on the same JSON file.
let writeQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.catch(() => {});
  return result;
}

// data/ can live on a persistent volume mounted at deploy time (e.g. a
// Railway volume) so admin edits survive redeploys. The first time that
// volume is attached it mounts empty, hiding the seed files that ship in
// the image — so on ENOENT we fall back to data-seed/ and copy it into
// data/ once, self-healing the volume instead of crashing every request.
const seeding = new Map<string, Promise<void>>();
function ensureSeeded(file: string, seedFile: string): Promise<void> {
  let promise = seeding.get(file);
  if (!promise) {
    promise = (async () => {
      const seedRaw = await fs.readFile(seedFile, "utf-8");
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(file, seedRaw, "utf-8");
    })();
    seeding.set(file, promise);
  }
  return promise;
}

async function readJson<T>(file: string, seedFile: string): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    await ensureSeeded(file, seedFile);
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

export async function getCategories(): Promise<Category[]> {
  const categories = await readJson<Category[]>(CATEGORIES_FILE, CATEGORIES_SEED);
  return categories.sort((a, b) => a.order - b.order);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  return enqueue(() => writeJson(CATEGORIES_FILE, categories));
}

export async function getProducts(): Promise<Product[]> {
  const products = await readJson<Product[]>(PRODUCTS_FILE, PRODUCTS_SEED);
  return products.sort((a, b) => a.order - b.order);
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.active);
}

export async function saveProducts(products: Product[]): Promise<void> {
  return enqueue(() => writeJson(PRODUCTS_FILE, products));
}

export async function getSettings(): Promise<Settings> {
  return readJson<Settings>(SETTINGS_FILE, SETTINGS_SEED);
}

export async function saveSettings(settings: Settings): Promise<void> {
  return enqueue(() => writeJson(SETTINGS_FILE, settings));
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
