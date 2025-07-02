
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Category } from '@/types';
import { Atom, Calculator, Briefcase, Languages } from 'lucide-react';

// NOTE: This is a simple in-memory cache. In a real-world application,
// you might want to use a more sophisticated caching strategy or Next.js's
// data caching features.
let categoriesCache: Category[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Atom,
  Calculator,
  Briefcase,
  Languages,
};

type FirestoreCategory = Omit<Category, 'icon' | 'subcategories'> & {
    icon?: string;
    parentId?: string | null;
}

/**
* Fetches all categories from Firestore and builds a nested tree structure.
* Uses a simple in-memory cache to avoid redundant database calls.
*/
export async function fetchCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && (now - lastFetchTime < CACHE_DURATION)) {
    return categoriesCache;
  }

  const categoriesCol = collection(db, 'categories');
  const categorySnapshot = await getDocs(categoriesCol);
  const categoryList: (Category & { parentId?: string | null })[] = categorySnapshot.docs.map(doc => {
    const data = doc.data() as FirestoreCategory;
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      icon: data.icon ? iconMap[data.icon] : undefined,
      parentId: data.parentId || null,
    };
  });

  const categoryMap = new Map(categoryList.map(c => [c.id, { ...c, subcategories: [] }]));
  const tree: Category[] = [];

  for (const category of categoryList) {
      const mappedCategory = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.subcategories!.push(mappedCategory);
      }
    } else {
      tree.push(mappedCategory);
    }
  }

  categoriesCache = tree;
  lastFetchTime = now;
  return tree;
}


// Recursive helper to find a category by its ID in a tree
function findCategory(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const found = findCategory(category.subcategories, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
* Finds a category by its ID from a given category tree.
*/
export function getCategoryById(id: string, allCategories: Category[]): Category | undefined {
  return findCategory(allCategories, id);
}

/**
* Gets all descendant category IDs for a given category, including the starting category.
*/
export function getDescendantCategoryIds(startId: string, allCategories: Category[]): string[] {
  const ids: string[] = [];
  const startCategory = findCategory(allCategories, startId);
  if (!startCategory) return [];

  const queue: Category[] = [startCategory];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ids.push(current.id);
    if (current.subcategories) {
      queue.push(...current.subcategories);
    }
  }
  return ids;
}

/**
* Creates a flattened list of categories suitable for UI elements like select dropdowns.
*/
export function getFlattenedCategories(cats: Category[]): { id:string; name: string; level: number; isParent: boolean }[] {
  const flat: { id: string; name: string; level: number; isParent: boolean }[] = [];
  function recurse(categories: Category[], level: number) {
    for (const category of categories) {
      const hasSubcategories = !!category.subcategories && category.subcategories.length > 0;
      flat.push({ id: category.id, name: category.name, level, isParent: hasSubcategories });
      if (hasSubcategories) {
        recurse(category.subcategories, level + 1);
      }
    }
  }
  recurse(cats, 0);
  return flat;
}


/**
* Gets the hierarchical path (breadcrumbs) for a given category ID.
*/
export function getCategoryPath(id: string, allCategories: Category[]): Category[] | null {
  function findPath(cats: Category[], id: string, path: Category[]): Category[] | null {
    for (const category of cats) {
      const newPath = [...path, { ...category, subcategories: undefined }];
      if (category.id === id) return newPath;
      if (category.subcategories) {
        const found = findPath(category.subcategories, id, newPath);
        if (found) return found;
      }
    }
    return null;
  }
  return findPath(allCategories, id, []);
}

// Keep a sync version for mock data in other parts of the app
export function getPaperById(id: string): Paper | undefined {
  // This function will need to be updated when papers are moved to Firestore
  const { papers } = require('@/lib/data');
  return papers.find((paper: Paper) => paper.id === id);
}
