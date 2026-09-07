// Frontend Fuzzy String & Contact Matcher

export function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b) ? Math.max((a || "").length, (b || "").length) : 0;
  const al = a.length;
  const bl = b.length;
  const matrix = [];

  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[al][bl];
}

export function calculateSimilarity(str1, str2) {
  const s1 = (str1 || "").toLowerCase().trim();
  const s2 = (str2 || "").toLowerCase().trim();

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

export function matchContact(spokenName, contacts = []) {
  if (!spokenName || !Array.isArray(contacts) || contacts.length === 0) {
    return {
      found: false,
      bestMatch: null,
      isAmbiguous: false,
      candidates: [],
      spokenName
    };
  }

  const cleanSpoken = spokenName.toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim();
  const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);

  const scored = contacts.map((contact) => {
    const fullname = (contact.fullname || "").toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim();
    const username = (contact.username || "").toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim();
    const nameTokens = fullname.split(/\s+/).filter(Boolean);

    let maxScore = 0;

    if (cleanSpoken === fullname || cleanSpoken === username) {
      maxScore = 1.0;
    } else if (nameTokens.includes(cleanSpoken)) {
      maxScore = 0.95;
    } else if (fullname.includes(cleanSpoken) || username.includes(cleanSpoken)) {
      maxScore = 0.90;
    } else {
      const fullSim = calculateSimilarity(cleanSpoken, fullname);
      const userSim = calculateSimilarity(cleanSpoken, username);
      maxScore = Math.max(fullSim, userSim);

      for (const sToken of spokenTokens) {
        for (const nToken of nameTokens) {
          const tokenSim = calculateSimilarity(sToken, nToken);
          if (tokenSim > maxScore) {
            maxScore = tokenSim;
          }
        }
      }
    }

    return {
      contact,
      score: Math.round(maxScore * 100) / 100
    };
  });

  const candidates = scored
    .filter((item) => item.score >= 0.65)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      found: false,
      bestMatch: null,
      isAmbiguous: false,
      candidates: [],
      spokenName
    };
  }

  const top = candidates[0];

  const closeMatches = candidates.filter(
    (c) => Math.abs(c.score - top.score) <= 0.08 && c.score >= 0.80
  );

  if (closeMatches.length > 1) {
    return {
      found: true,
      bestMatch: top.contact,
      score: top.score,
      isAmbiguous: true,
      candidates: closeMatches.map((c) => c.contact),
      spokenName
    };
  }

  return {
    found: true,
    bestMatch: top.contact,
    score: top.score,
    isAmbiguous: false,
    candidates: [top.contact],
    spokenName
  };
}
