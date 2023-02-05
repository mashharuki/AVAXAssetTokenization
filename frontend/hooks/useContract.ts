import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import AssetTokenizationArtifact from "../artifacts/AssetTokenization.json";
import { AssetTokenization as AssetTokenizationType } from "../types";
import { getEthereum } from "../utils/ethereum";

export const AssetTokenizationAddress = "0xE826Cd4D79d3a28553ad190a36fbDb4de9574710";

type PropsUseContract = {
    currentAccount: string | undefined;
};

type ReturnUseContract = {
    assetTokenization: AssetTokenizationType | undefined;
};

/**
 * useContract hook
 * @param param0 
 * @returns 
 */
export const useContract = ({
    currentAccount,
}: PropsUseContract): ReturnUseContract => {
    const [assetTokenization, setAssetTokenization] = useState<AssetTokenizationType>();
    const ethereum = getEthereum();

    /**
     * getContract function
     */
    const getContract = useCallback(
        (
            contractAddress: string,
            abi: ethers.ContractInterface,
            storeContract: (_: ethers.Contract) => void
        ) => {
            if (!ethereum) {
                console.log("Ethereum object doesn't exist!");
                return;
            }
            if (!currentAccount) {
                console.log("currentAccount doesn't exist!");
                return;
            }
            try {
                // @ts-ignore: ethereum as ethers.providers.ExternalProvider
                const provider = new ethers.providers.Web3Provider(ethereum);
                // get signer
                const signer = provider.getSigner(); 
                const Contract = new ethers.Contract(contractAddress, abi, signer);
                storeContract(Contract);
            } catch (error) {
                console.log(error);
            }
        },[ethereum, currentAccount]
    );

    useEffect(() => {
        // call getContract
        getContract(
            AssetTokenizationAddress,
            AssetTokenizationArtifact.abi,
            (Contract: ethers.Contract) => {
                setAssetTokenization(Contract as AssetTokenizationType);
            }
        );
    }, [ethereum, currentAccount, getContract]);

    return {
        assetTokenization,
    };
};