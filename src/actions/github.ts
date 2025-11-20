'use server';

const GITHUB_API_URL = 'https://api.github.com';

async function fetchGithubAPI(url: string) {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    return await fetch(url, { headers });
}


export async function getReposForUser(username: string) {
  try {
    const response = await fetchGithubAPI(`${GITHUB_API_URL}/users/${username}/repos`);
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
    const response = await fetchGithubAPI(`${GITHUB_API_URL}/repos/${repoFullName}/contents/${path}`);
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
    const response = await fetchGithubAPI(`${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`);
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
