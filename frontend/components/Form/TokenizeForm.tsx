import { useContext, useState } from "react";
import styles from "./TokenizeForm.module.css";
import CurrentAccountContext from "../../context/CurrentAccountProvider";
import { useContract } from "../../hooks/useContract";
import { validAmount } from "../../utils/validAmount";
import ActionButton from "../Button/ActionButton";
import { avaxToWei } from "../../utils/formatter";

/**
 * TokenizeForm Component
 * @returns 
 */
export default function TokenizeForm() {
    const [currentAccount] = useContext(CurrentAccountContext);
    const { assetTokenization } = useContract({ currentAccount });

    const [farmerName, setFarmerName] = useState("");
    const [description, setDescription] = useState("");
    const [totalMint, setTotalMint] = useState("");
    const [price, setPrice] = useState("");
    const [expirationDate, setExpirationDate] = useState("");

    /**
     * validInput function
     * @returns 
     */
    const validInput = () => {
        if (farmerName === "") {
            alert("enter farmer name");
            return false;
        }
        if (description === "") {
            alert("enter description name");
            return false;
        }
        if (!validAmount(totalMint)) {
            alert("invalid total number of mint");
            return false;
        }
        if (!validAmount(price)) {
            alert("invalid price");
            return false;
        }
        if (expirationDate === "") {
            alert("invalid expiration date");
            return false;
        }
        return true;
    };

    /**
     * dateToSeconds function
     * @param date 
     * @returns 
     */
    const dateToSeconds = (date: string) => {
        const dateInDate = new Date(date);
        const dateInSeconds = Math.floor(dateInDate.getTime() / 1000);
        return dateInSeconds.toString();
    };

    /**
     * onClickGenerateNFT function
     * @returns 
     */
    const onClickGenerateNFT = async () => {
        if (!currentAccount) {
            alert("connect wallet");
            return;
        }
        if (!assetTokenization) return;
        if (!validInput()) return;

        try {
            const priceInWei = avaxToWei(price);
            const dateInSeconds = dateToSeconds(expirationDate);
            // generateNftContract function
            const txn = await assetTokenization.generateNftContract(
                farmerName,
                description,
                totalMint,
                priceInWei,
                dateInSeconds
            );
            await txn.wait();

            setFarmerName("");
            setDescription("");
            setTotalMint("");
            setPrice("");
            setExpirationDate("");
            alert("Success");
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.field}>
                <p>Farmer name:</p>
                <input
                    className={styles.line}
                    type="text"
                    onChange={(e) => setFarmerName(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <p>description:</p>
                <textarea
                    className={styles.text_area}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <p>total number of mint:</p>
                <input
                    className={styles.line}
                    type="number"
                    value={totalMint}
                    onChange={(e) => setTotalMint(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <p>price:</p>
                <input
                    className={styles.line}
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <p>expiration date:</p>
                <input
                    className={styles.date}
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                />
            </div>

            <div className={styles.field_button}>
                <ActionButton
                    title={"Generate NFT"}
                    onClick={onClickGenerateNFT}
                    disable={false}
                />
            </div>
        </div>
    );
}