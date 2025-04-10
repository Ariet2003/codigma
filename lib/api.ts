type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

class Api {
  private async request(url: string, options: RequestOptions = {}) {
    const { method = 'GET', headers = {}, body } = options;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get(url: string, headers?: Record<string, string>) {
    return this.request(url, { headers });
  }

  async post(url: string, body: any, headers?: Record<string, string>) {
    return this.request(url, {
      method: 'POST',
      headers,
      body,
    });
  }

  async put(url: string, body: any, headers?: Record<string, string>) {
    return this.request(url, {
      method: 'PUT',
      headers,
      body,
    });
  }

  async delete(url: string, headers?: Record<string, string>) {
    return this.request(url, {
      method: 'DELETE',
      headers,
    });
  }
}

export const api = new Api(); 