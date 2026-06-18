import { Alert, Box, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const alertPalettes = {
  error: "red",
  info: "blue",
  success: "green",
  warning: "yellow",
};

export default function ToastListener() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      const { status, title, description } = e.detail;
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [
        ...currentToasts,
        { id, status, title, description },
      ]);

      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id),
        );
      }, 5000);
    };

    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, []);


  return (
    <Box
      position="fixed"
      top="60px"
      right="3"
      zIndex="toast"
      width={{ base: "calc(100% - 2rem)", sm: "400px" }}
    >
      <Stack gap="4" width="full">
        {toasts.map((toast) => {
          const palette = alertPalettes[toast.status] || "gray";

          return (
            <Alert.Root
              key={toast.id}
              status={toast.status}
              bg={`${palette}.focusRing`}
              borderColor={`${palette}.subtle`}
              borderWidth="2px"
              color={`${palette}.contrast`}
            >
              <Alert.Indicator color={`${palette}.muted`} />
              <Box>
                <Alert.Title>{toast.title}</Alert.Title>
                {toast.description && (
                  <Alert.Description>
                    {typeof toast.description === 'object'
                      ? toast.description.message || JSON.stringify(toast.description)
                      : toast.description}
                  </Alert.Description>
                )}
              </Box>
            </Alert.Root>
          );
        })}
      </Stack>
    </Box>
  );
}
