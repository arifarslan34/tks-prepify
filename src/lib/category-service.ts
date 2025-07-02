
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Category, Paper } from '@/types';
import { Atom, Calculator, Briefcase, Languages } from 'lucide-react';
import { slugify } from './utils';

// NOTE: Caching is now handled by Next.js's data caching features.
// The previous in-memory cache caused inconsistencies between server and client environments.

export function clearCategoriesCache() {
  // This is now a no-op as we are not using in-memory cache.
  // Kept for compatibility to avoid breaking calls to it.
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Atom,
  Calculator,
  Briefcase,
  Languages,
};

type FirestoreCategory = Omit<Category, 'icon' | 'subcategories' | 'slug'> & {
    icon?: string;
    parentId?: string | null;
    featured?: boolean;
    slug?: string;
}

/**
* Fetches all categories from Firestore and builds a nested tree structure.
*/
export async function fetchCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, 'categories');
  const categorySnapshot = await getDocs(categoriesCol);
  const categoryList: (Category & { parentId?: string | null })[] = categorySnapshot.docs.map(doc => {
    const data = doc.data() as FirestoreCategory;
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      icon: data.icon ? iconMap[data.icon] : undefined,
      parentId: data.parentId || null,
      featured: data.featured || false,
    };
  });

  const categoryMap = new Map(categoryList.map(c => [c.id, { ...c, subcategories: [] as Category[] }]));
  const tree: Category[] = [];

  for (const category of categoryList) {
      const mappedCategory = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.subcategories.push(mappedCategory);
      }
    } else {
      tree.push(mappedCategory);
    }
  }

  // Sort top-level categories, featured first
  tree.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Sort sub-categories by name
  categoryMap.forEach(cat => {
    if(cat.subcategories) {
      cat.subcategories.sort((a,b) => a.name.localeCompare(b.name));
    }
  });


  return tree;
}


// Recursive helper to find a category by its ID in a tree
function findCategoryById(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const found = findCategoryById(category.subcategories, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
* Finds a category by its ID from a given category tree.
*/
export function getCategoryById(id: string, allCategories: Category[]): Category | undefined {
  return findCategoryById(allCategories, id);
}

// Recursive helper to find a category by its slug in a tree
function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) return category;
    if (category.subcategories) {
      const found = findCategoryBySlug(category.subcategories, slug);
      if (found) return found;
    }
  }
  return undefined;
}

/**
* Finds a category by its slug from a given category tree.
*/
export function getCategoryBySlug(slug: string, allCategories: Category[]): Category | undefined {
  return findCategoryBySlug(allCategories, slug);
}


/**
* Gets all descendant category IDs for a given category, including the starting category.
*/
export function getDescendantCategoryIds(startId: string, allCategories: Category[]): string[] {
  const ids: string[] = [];
  const startCategory = findCategoryById(allCategories, startId);
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

export function getPaperBySlug(slug: string): Paper | undefined {
  const { papers } = require('@/lib/data');
  return papers.find((paper: Paper) => paper.slug === slug);
}
