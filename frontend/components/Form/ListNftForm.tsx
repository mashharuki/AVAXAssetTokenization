import { useCallback, useContext, useEffect, useState } from "react";
import CurrentAccountContext from "../../context/CurrentAccountProvider";
import { useContract } from "../../hooks/useContract";
import styles from "./ListNftForm.module.css";
import ActionButton from "../Button/ActionButton";
import {
  avaxToWei,
  weiToAvax,
  blockTimeStampToDate,
} from "../../utils/formatter";

type FarmNftDetailsType = {
    farmerAddress: string;
    farmerName: string;
    description: string;
    totalMint: string;
    availableMint: string;
    price: string;
    expirationDate: Date;
};

/**
 * ListNftForm Component
 * @returns 
 */
export default function ListNftForm() {
    const [currentAccount] = useContext(CurrentAccountContext);
    const { assetTokenization } = useContract({ currentAccount });
    const [allNftDetails, setAllNftDetails] = useState<FarmNftDetailsType[]>([]);

    /**
     * onClickBuyNft function
     * @param farmerAddress 
     * @param priceInAvax 
     * @returns 
     */
    const onClickBuyNft = async (farmerAddress: string, priceInAvax: string) => {
        if (!currentAccount) {
            alert("connect wallet");
            return;
        }
        if (!assetTokenization) return;

        try {
            const priceInWei = avaxToWei(priceInAvax);

            const txn = await assetTokenization.buyNft(farmerAddress, {
                value: priceInWei,
            });

            await txn.wait();
            alert("Success");
        } catch (error) {
            alert(error);
        }
    };

    /**
     * NftDetailsCard Component
     * @param param0 
     * @returns 
     */
    const NftDetailsCard = ({ details }: { details: FarmNftDetailsType }) => {
        return (
            <div className={styles.card}>
                <p>farmer address: {details.farmerAddress}</p>
                <p>farmer name: {details.farmerName}</p>
                <p>description: {details.description}</p>
                <p>total mint: {details.totalMint}</p>
                <p>availableMint: {details.availableMint}</p>
                <p>price: {details.price}</p>
                <p>expiration date: {details.expirationDate.toString()}</p>
                <div className={styles.center}>
                    <ActionButton
                        title={"Buy NFT"}
                        onClick={() => onClickBuyNft(details.farmerAddress, details.price)}
                        disable={details.availableMint === "0"}
                    />
                </div>
            </div>
        );
    };

    /**
     * getAllNftDetails function
     */
    const getAllNftDetails = useCallback(async () => {
        if (!currentAccount) {
            alert("connect wallet");
            return;
        }
        if (!assetTokenization) return;

        const farmers = await assetTokenization.getFarmers();
        let allDetails: FarmNftDetailsType[] = [];

        for (let index = 0; index < farmers.length; index++) {
            const available = await assetTokenization.availableContract(
                farmers[index]
            );
            if (available) {
                const details = await assetTokenization.getNftContractDetails(
                    farmers[index]
                );
                allDetails.push({
                    farmerAddress: details.farmerAddress,
                    farmerName: details.farmerName,
                    description: details.description,
                    totalMint: details.totalMint.toString(),
                    availableMint: details.availableMint.toString(),
                    price: weiToAvax(details.price),
                    expirationDate: blockTimeStampToDate(details.expirationDate),
                } as FarmNftDetailsType);
            }
        }
        setAllNftDetails(allDetails);
    }, [currentAccount, assetTokenization]);

    useEffect(() => {
        getAllNftDetails();
    }, [getAllNftDetails]);

    return (
        <div>
            <p className={styles.center}>Available NFT</p>
            {allNftDetails.map((details, index) => {
                return (
                    <div key={index} className={styles.center}>
                        <NftDetailsCard details={details} />
                    </div>
                );
            })}
        </div>
    );
}