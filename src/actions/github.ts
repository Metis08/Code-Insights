'use server';

export async function getReposForUser(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'User not found.' };
      }
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to fetch repositories.' };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.' };
  }
}
