import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export default function ChakraWrapper({ children }) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  );
}