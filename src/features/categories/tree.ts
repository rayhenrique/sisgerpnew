import type { Category, CategoryNode, CategoryType } from "@/features/categories/types";

export function buildCategoryTree(categories: Category[]) {
  const nodesById = new Map<string, CategoryNode>();

  for (const c of categories) {
    nodesById.set(c.id, { ...c, children: [] });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodesById.values()) {
    if (node.parent_id && nodesById.has(node.parent_id)) {
      nodesById.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (list: CategoryNode[]) => {
    list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    for (const n of list) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}

export function filterCategoryTree(
  nodes: CategoryNode[],
  opts: { search?: string; type?: CategoryType | "all" }
) {
  const normalizedSearch = (opts.search ?? "").trim().toLowerCase();
  const type = opts.type ?? "all";

  const matches = (node: CategoryNode) => {
    const matchesType = type === "all" ? true : node.type === type;
    const matchesSearch =
      normalizedSearch.length === 0
        ? true
        : node.name.toLowerCase().includes(normalizedSearch);
    return matchesType && matchesSearch;
  };

  const walk = (node: CategoryNode): CategoryNode | null => {
    const filteredChildren = node.children
      .map(walk)
      .filter((c): c is CategoryNode => c !== null);

    if (matches(node) || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  return nodes.map(walk).filter((n): n is CategoryNode => n !== null);
}

