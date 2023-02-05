import styles from "./DefaultLayout.module.css";
import Link from "next/link";
import CurrentAccountContext from "../../context/CurrentAccountProvider";
import { useContext, ReactNode } from "react";

type Props = {
    children: ReactNode;
    home?: boolean;
};

/**
 * DefaultLayout Component
 * @param param0 
 * @returns 
 */
export default function DefaultLayout({ children, home }: Props) {
    const [currentAccount, connectWallet] = useContext(CurrentAccountContext);

    return (
        <div>
            <div className={styles.navBar}>
                <div className={styles.rightHeader}>
                    <div className={styles.appName}> Asset Tokenization </div>
                </div>
                {currentAccount == undefined ? (
                    <div className={styles.connectBtn} onClick={connectWallet}>
                        {" "}
                        Connect to wallet{" "}
                    </div>
                ) : (
                    <div className={styles.connected}>
                        {" "}
                        {"Connected to " + currentAccount}{" "}
                    </div>
                )}
            </div>
            <div>{children}</div>
            {!home && (
                <Link href="/">
                    <div className={styles.backToHome}>Back to home</div>
                </Link>
            )}
        </div>
    );
}