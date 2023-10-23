/**
 * Randomly picks an element from an array
 *
 * This generic function takes an array of type T and returns a
 * randomly selected element from it. If the array is empty,
 * it returns null.
 *
 * @template T - The type of elements in the array
 */
export const draw = <T>(arr: T[]): T | null => {
  // Check for an empty array
  if (arr.length === 0) {
    return null;
  }

  // Return the element at the random index
  return arr[Math.floor(Math.random() * arr.length)];
};
