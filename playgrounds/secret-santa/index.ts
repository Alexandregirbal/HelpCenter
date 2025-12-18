type Exclusion = [string | string[], string | string[] | "*", boolean?]; // [giver(s), receiver(s) or *, bidirectional]
type Assignment = Map<string, string>; // giver -> receiver

/**
 * Creates a secret santa assignment respecting exclusion constraints.
 *
 * @param people - Array of participant names
 * @param exclusions - Array of [giver(s), receiver(s), bidirectional?] tuples
 *                     - giver(s) and receiver(s) can be a single string or array of strings
 *                     - Use "*" as receiver to prevent someone from receiving any gifts (e.g., ["Gérard", "*"])
 *                     - Arrays allow easy handling of families/groups (e.g., [["Alice", "Bob"], ["Charlie", "Diana"], true])
 *                     - bidirectional=true prevents both A→B and B→A
 * @returns Map of giver → receiver assignments
 * @throws Error if no valid assignment exists
 */
export function secretSanta(
  people: string[],
  exclusions: Exclusion[] = []
): Assignment {
  if (people.length < 2) {
    throw new Error("Need at least 2 people for secret santa");
  }

  // Check for duplicates
  const peopleSet = new Set(people);
  if (peopleSet.size !== people.length) {
    const duplicates = people.filter(
      (person, index) => people.indexOf(person) !== index
    );
    throw new Error(
      `Duplicate people found: ${[...new Set(duplicates)].join(", ")}`
    );
  }

  // Normalize and validate exclusions
  const normalizedExclusions: Array<[string, string, boolean]> = [];

  for (const [givers, receivers, bidirectional = false] of exclusions) {
    const giverArray = Array.isArray(givers) ? givers : [givers];

    // Handle wildcard "*" receiver - expand to all people
    let receiverArray: string[];
    if (receivers === "*") {
      receiverArray = people; // Everyone as receiver
    } else {
      receiverArray = Array.isArray(receivers) ? receivers : [receivers];
    }

    // Validate all people exist
    for (const giver of giverArray) {
      if (!peopleSet.has(giver)) {
        throw new Error(`Unknown person in exclusion: ${giver}`);
      }
    }
    if (receivers !== "*") {
      for (const receiver of receiverArray) {
        if (!peopleSet.has(receiver)) {
          throw new Error(`Unknown person in exclusion: ${receiver}`);
        }
      }
    }

    // Expand to individual exclusions
    for (const giver of giverArray) {
      for (const receiver of receiverArray) {
        normalizedExclusions.push([giver, receiver, bidirectional]);
      }
    }
  }

  // Build exclusion set for quick lookup
  const excluded = new Set<string>();
  for (const [giver, receiver, bidirectional] of normalizedExclusions) {
    excluded.add(`${giver}→${receiver}`);
    if (bidirectional) {
      excluded.add(`${receiver}→${giver}`);
    }
  }

  // Check if assignment is allowed
  const isAllowed = (giver: string, receiver: string): boolean => {
    return giver !== receiver && !excluded.has(`${giver}�${receiver}`);
  };

  // Backtracking algorithm to find valid assignment
  const assignment = new Map<string, string>();
  const available = new Set(people);

  const backtrack = (index: number): boolean => {
    if (index === people.length) {
      // Check if last person can give to first person (circular constraint)
      const lastPerson = people[people.length - 1];
      const firstPerson = people[0];
      return isAllowed(lastPerson, firstPerson);
    }

    const giver = people[index];

    // Try each available receiver
    for (const receiver of Array.from(available)) {
      // Special case: if this is the last assignment, ensure it closes the circle
      if (index === people.length - 1) {
        // Last person must give to the first person to close the circle
        const firstPerson = people[0];
        if (receiver === firstPerson && isAllowed(giver, receiver)) {
          assignment.set(giver, receiver);
          return true;
        }
        continue;
      }

      // For non-last assignments, can't give to first person (reserved for closing circle)
      if (receiver === people[0]) {
        continue;
      }

      if (isAllowed(giver, receiver)) {
        assignment.set(giver, receiver);
        available.delete(receiver);

        if (backtrack(index + 1)) {
          return true;
        }

        // Backtrack
        assignment.delete(giver);
        available.add(receiver);
      }
    }

    return false;
  };

  if (!backtrack(0)) {
    throw new Error(
      "No valid secret santa assignment exists with the given exclusions"
    );
  }

  return assignment;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a randomized secret santa assignment.
 * Shuffles people to increase randomness in assignments.
 * Retries multiple times with different shuffles if needed.
 */
export function randomSecretSanta(
  people: string[],
  exclusions: Exclusion[] = []
): Assignment {
  const maxAttempts = people.length ** 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const shuffled = shuffle(people);
      return secretSanta(shuffled, exclusions);
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error; // Rethrow on last attempt
      }
      // Try again with a different shuffle
    }
  }
  throw new Error("Failed to find valid assignment after maximum attempts");
}

/**
 * Main function to create secret santa assignments with historical constraints.
 * Ensures people don't give to the same person they've given to in previous years.
 *
 * @param people - Array of participant names
 * @param exclusions - Array of [giver, receiver, bidirectional?] tuples for manual exclusions
 * @param past - Array of past year assignments (each is a Map of giver → receiver)
 * @returns Map of giver → receiver assignments for this year
 * @throws Error if no valid assignment exists
 */
export function main(
  people: string[],
  exclusions: Exclusion[] = [],
  past: Assignment[] = []
): Assignment {
  console.log("🎄 Starting Secret Santa assignment...");

  // Combine manual exclusions with historical exclusions
  const allExclusions: Exclusion[] = [...exclusions];

  // Add exclusions from past assignments (unidirectional - just prevent same pairing)
  for (const pastAssignment of past) {
    for (const [giver, receiver] of pastAssignment) {
      allExclusions.push([giver, receiver]);
    }
  }

  // Remove duplicate exclusions
  const uniqueExclusions = Array.from(
    new Map(
      allExclusions.map(([giver, receiver, bidirectional]) => [
        `${giver}→${receiver}→${bidirectional ?? false}`,
        [giver, receiver, bidirectional] as Exclusion,
      ])
    ).values()
  );

  return randomSecretSanta(people, uniqueExclusions);
}

/**
 * Prints assignment in a readable format
 */
export function printAssignment(assignment: Assignment): void {
  console.log("\n🎅 Secret Santa Assignments:");
  for (const [giver, receiver] of assignment) {
    console.log(`  ${giver} → ${receiver}`);
  }
}
const testing = () => {
  // Example usage
  console.log("\n=� Example 1: Simple assignment (no exclusions)");
  const people1 = ["Alice", "Bob", "Charlie", "Diana"];
  const result1 = randomSecretSanta(people1);
  printAssignment(result1);

  console.log("\n=� Example 2: With unidirectional exclusions");
  const people2 = ["Alice", "Bob", "Charlie", "Diana"];
  const exclusions2: Exclusion[] = [
    ["Alice", "Bob"], // Alice can't give to Bob (but Bob can give to Alice)
    ["Charlie", "Diana"], // Charlie can't give to Diana
  ];
  const result2 = randomSecretSanta(people2, exclusions2);
  printAssignment(result2);

  console.log("\n=� Example 3: With family exclusions (using arrays)");
  const people3 = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
  const exclusions3: Exclusion[] = [
    [["Alice", "Bob"], ["Alice", "Bob"], true], // Family 1: Alice & Bob can't give to each other
    [["Charlie", "Diana"], ["Charlie", "Diana"], true], // Family 2: Charlie & Diana can't give to each other
  ];
  const result3 = randomSecretSanta(people3, exclusions3);
  printAssignment(result3);

  console.log("\n=� Example 4: Using excludeFamily() helper");
  const people4 = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
  const exclusions4: Exclusion[] = [
    excludeFamily(["Alice", "Bob"]), // Family 1
    excludeFamily(["Charlie", "Diana"]), // Family 2
  ];
  const result4 = randomSecretSanta(people4, exclusions4);
  printAssignment(result4);

  console.log("\n=� Example 5: Using main() with past assignments");
  const people5 = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];

  // Simulate past year assignment (just one year to keep it simple)
  const year2023: Assignment = new Map([
    ["Alice", "Bob"],
    ["Bob", "Charlie"],
    ["Charlie", "Diana"],
    ["Diana", "Eve"],
    ["Eve", "Frank"],
    ["Frank", "Alice"],
  ]);

  const exclusions5: Exclusion[] = [];

  const result5 = main(people5, exclusions5, [year2023]);
  console.log("\n  2024 (new, avoiding 2023 pairings):");
  printAssignment(result5);
};

// testing();

const run = () => {
  console.log("Running Secret Santa Assignment...\n");

  const people = [
    "Apolline",
    "Alexandre",
    "Ségolène",
    "Stéphane",
    "Anna",
    "Carla",
    "Gérard",
    "Marie",
    "Edouard",
    "Frédérique",
    "Prune",
    "Lola",
    "Oscar",
    "Justine",
    "Jean-Bertrand",
    "Paul",
  ];

  const exclusions: Exclusion[] = [
    // Families (bidirectional exclusions)
    [["Apolline", "Alexandre"], ["Apolline", "Alexandre"], true],
    [["Ségolène", "Stéphane"], ["Ségolène", "Stéphane"], true],
    [["Anna", "Carla"], ["Anna", "Carla"], true],
    [["Marie", "Edouard"], ["Marie", "Edouard"], true],
    [["Frédérique", "Prune"], ["Frédérique", "Prune"], true],
    [["Lola", "Oscar"], ["Lola", "Oscar"], true],
    [["Justine", "Jean-Bertrand"], ["Justine", "Jean-Bertrand"], true],
    // Gérard and Marie cannot receive gifts
    ["*", "Gérard"],
    ["*", "Marie"],
    // Additional constraints
    [["Paul", "Jean-Bertrand"], ["Apolline", "Alexandre"], true],
  ];

  const result = main(people, exclusions);

  printAssignment(result);
};

run();
