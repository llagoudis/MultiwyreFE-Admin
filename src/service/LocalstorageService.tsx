class LocalstorageService {
  setLocalAccessToken(token: string) {
    localStorage.setItem("token", "Bearer " + token);
  }

  getLocalAccessToken() {
    return localStorage.getItem("token");
  }

  encodeAuthBody(data: any) {
    return localStorage.setItem("authBody", btoa(JSON.stringify(data)));
  }

  decodeAuthBody() {
    const data = localStorage.getItem("authBody");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? JSON.parse(atob(data)) : "undefined";
  }

  updateAuthBody(updatedKeys: Record<string, any>) {
    const data = localStorage.getItem("authBody");
    let parsedData = data ? JSON.parse(atob(data)) : {};
    parsedData = { ...parsedData, ...updatedKeys };
    localStorage.setItem("authBody", btoa(JSON.stringify(parsedData)));
  }

  setItem(key: string, data: string) {
    return localStorage.setItem(key, data);
  }

  getItem(key: string) {
    return localStorage.getItem(key);
  }

  clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
  }
}

const localStorageService = new LocalstorageService();

export default localStorageService;
