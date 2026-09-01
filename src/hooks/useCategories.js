import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../lib/apiClient';

// Flat list → tree. Each returned node carries a .children array (possibly empty).
export function buildTree(flat) {
  const byId = new Map();
  flat.forEach((c) => byId.set(c.id, { ...c, children: [] }));

  const roots = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (nodes) => {
    nodes.sort(
      (a, b) =>
        a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en)
    );
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

// Given a category id, return that id + every descendant id.
export function collectDescendantIds(flat, rootId) {
  if (!rootId) return [];
  const childrenByParent = new Map();
  flat.forEach((c) => {
    if (!c.parent_id) return;
    if (!childrenByParent.has(c.parent_id))
      childrenByParent.set(c.parent_id, []);
    childrenByParent.get(c.parent_id).push(c.id);
  });

  const out = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop();
    out.push(id);
    const kids = childrenByParent.get(id) || [];
    stack.push(...kids);
  }
  return out;
}

// Find category by slug (case-insensitive).
export function findBySlug(flat, slug) {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return flat.find((c) => c.slug.toLowerCase() === s) || null;
}

// Breadcrumb from root → category.
export function getAncestors(flat, catId) {
  const byId = new Map(flat.map((c) => [c.id, c]));
  const chain = [];
  let cur = byId.get(catId);
  while (cur) {
    chain.unshift(cur);
    cur = cur.parent_id ? byId.get(cur.parent_id) : null;
  }
  return chain;
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      setCategories((await api.get('/categories')) || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const tree = useMemo(() => buildTree(categories), [categories]);

  return { categories, tree, loading, error, refetch: fetchCategories };
}

// Admin variant: includes inactive categories + returns mutators.
export function useAdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setCategories((await api.get('/admin/categories')) || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const tree = useMemo(() => buildTree(categories), [categories]);

  return { categories, tree, loading, error, refetch: fetchAll };
}
