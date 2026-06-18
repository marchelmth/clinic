export function showToast(status, title, description) {
  window.dispatchEvent(
    new CustomEvent("show-toast", {
      detail: { status, title, description },
    }),
  );
}

