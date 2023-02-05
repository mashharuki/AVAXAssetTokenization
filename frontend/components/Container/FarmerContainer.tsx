import { useState } from "react";
import styles from "./FarmerContainer.module.css";
import TokenizeForm from "../Form/TokenizeForm";
import ViewBuyersForm from "../Form/ViewBuyersForm";

/**
 * FarmerContainer Component
 * @returns 
 */
export default function FarmerContainer() {
    // farmer actions
    const Tokenize = "Tokenize";
    const ViewBuyers = "ViewBuyers";

    const [activeTab, setActiveTab] = useState(Tokenize);

    return (
        <div>
            <div className={styles.selectTab}>
                <div
                    className={
                        styles.tabStyle +
                        " " +
                        (activeTab === Tokenize ? styles.activeTab : "")
                    }
                    onClick={() => setActiveTab(Tokenize)}
                >
                    {Tokenize}
                </div>
                <div
                    className={
                        styles.tabStyle +
                        " " +
                        (activeTab === ViewBuyers ? styles.activeTab : "")
                    }
                    onClick={() => setActiveTab(ViewBuyers)}
                >
                    {ViewBuyers}
                </div>
            </div>
            <div className={styles.tabBody}>
                {activeTab === Tokenize && <TokenizeForm />}
                {activeTab === ViewBuyers && <ViewBuyersForm />}
            </div>
        </div>
    );
}