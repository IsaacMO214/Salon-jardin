// Centralized API client for admin operations
export async function apiCall(
  token: string,
  url: string,
  payload: any,
  callbacks: {
    setIsLoading: (v: boolean) => void;
    showStatus: (msg: string) => void;
    onRefresh: () => void;
  }
): Promise<boolean> {
  callbacks.setIsLoading(true);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...payload })
    });
    const result = await res.json();
    if (result.success) {
      callbacks.showStatus("¡Guardado correctamente!");
      callbacks.onRefresh();
      return true;
    } else {
      callbacks.showStatus(result.message || result.error || "Error al guardar en el servidor.");
      return false;
    }
  } catch (err) {
    callbacks.showStatus("Error de comunicación de red.");
    return false;
  } finally {
    callbacks.setIsLoading(false);
  }
}
