// -----------------------------
//  0) Turkish Normalization
// -----------------------------
export const trLower = (text) => {
  return String(text ?? "")
    .trim()
    .toLocaleLowerCase("tr");
};

const normalizeTurkishCharacters = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/i̇/g, "i");
};

// ----------------------------------
// 1) Levenshtein Distance
// ----------------------------------
export const calculateLevenshteinDistance = (source, target) => {
  source = source.toLowerCase();
  target = target.toLowerCase();

  const sourceLength = source.length;
  const targetLength = target.length;

  const distanceRow = new Array(targetLength + 1);
  for (let j = 0; j <= targetLength; j++) distanceRow[j] = j;

  for (let i = 1; i <= sourceLength; i++) {
    let previousDiagonal = distanceRow[0];
    distanceRow[0] = i;

    for (let j = 1; j <= targetLength; j++) {
      const previousRowSameColumn = distanceRow[j];
      const substitutionCost = source[i - 1] === target[j - 1] ? 0 : 1;

      distanceRow[j] = Math.min(
        distanceRow[j] + 1,
        distanceRow[j - 1] + 1,
        previousDiagonal + substitutionCost
      );

      previousDiagonal = previousRowSameColumn;
    }
  }

  return distanceRow[targetLength];
};

export const levenshteinDistanceTrCaseInsensitive = (
  queryText,
  candidateText
) => {
  return calculateLevenshteinDistance(
    trLower(queryText),
    trLower(candidateText)
  );
};

// ----------------------
// 2) BK-Tree
// ----------------------
export class BKTreeNode {
  constructor(originalTerm) {
    this.originalTerm = originalTerm;
    this.normalizedTerm = trLower(originalTerm);
    this.children = new Map();
  }
}

export class BKTree {
  constructor(distanceFunction) {
    this.distanceFunction = distanceFunction;
    this.rootNode = null;
  }

  addTerm(originalTerm) {
    if (!originalTerm) return;

    const normalizedTerm = trLower(originalTerm);

    if (!this.rootNode) {
      this.rootNode = new BKTreeNode(originalTerm);
      return;
    }

    let currentNode = this.rootNode;

    while (true) {
      const distance = this.distanceFunction(
        normalizedTerm,
        currentNode.normalizedTerm
      );

      const childNode = currentNode.children.get(distance);

      if (!childNode) {
        currentNode.children.set(distance, new BKTreeNode(originalTerm));
        return;
      }

      currentNode = childNode;
    }
  }

  searchSimilarTerms(query, maxAllowedDistance = 2) {
    if (!this.rootNode) return [];

    const normalizedQuery = trLower(query);

    const results = [];
    const nodesToVisit = [this.rootNode];

    while (nodesToVisit.length > 0) {
      const node = nodesToVisit.pop();
      const distance = this.distanceFunction(
        normalizedQuery,
        node.normalizedTerm
      );

      if (distance <= maxAllowedDistance) {
        results.push({ term: node.originalTerm, distance });
      }

      const minEdgeDistance = distance - maxAllowedDistance;
      const maxEdgeDistance = distance + maxAllowedDistance;

      for (const [edgeDistance, childNode] of node.children) {
        if (
          edgeDistance >= minEdgeDistance &&
          edgeDistance <= maxEdgeDistance
        ) {
          nodesToVisit.push(childNode);
        }
      }
    }

    return results.sort(
      (a, b) => a.distance - b.distance || a.term.localeCompare(b.term, "tr")
    );
  }
}

//5) Suggestion API
export const getIngredientSuggestions = (
  userInput,
  { maxDistance = 2, maxSuggestions = 3, minimumInputLength = 2 } = {},
  ingredientSearchTree
) => {
  const rawInput = String(userInput ?? "").trim();
  if (!rawInput || rawInput.length < minimumInputLength) {
    return { isExactMatch: false, suggestions: [] };
  }

  const exactHits = ingredientSearchTree.searchSimilarTerms(rawInput, 0);
  const isExactMatch = exactHits.length > 0;

  if (isExactMatch) {
    return { isExactMatch: true, suggestions: [] };
  }

  const matches = ingredientSearchTree.searchSimilarTerms(
    rawInput,
    maxDistance
  );

  return {
    isExactMatch: false,
    suggestions: matches.slice(0, maxSuggestions),
  };
};
