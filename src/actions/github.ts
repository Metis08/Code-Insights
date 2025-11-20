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

export async function getRepoContents(repoFullName: string, path: string = '') {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`);
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to fetch repository contents.' };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.' };
  }
}

export async function searchRepositories(query: string) {
  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`);
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to search repositories.' };
    }
    const data = await response.json();
    return { data: data.items };
  } catch (error) {
    return { error: 'An unexpected error occurred.' };
  }
}
