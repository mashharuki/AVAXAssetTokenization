import "../styles/globals.css";
import { CurrentAccountProvider } from "../context/CurrentAccountProvider";
import type { AppProps } from "next/app";

/**
 * MyApp Component
 * @param param0 
 * @returns 
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CurrentAccountProvider>
      <Component {...pageProps} />
    </CurrentAccountProvider>
  );
}

export default MyApp;