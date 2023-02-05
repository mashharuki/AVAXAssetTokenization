import { BigNumber, ethers } from "ethers";

/**
 * weiToAvax function
 * @param wei 
 * @returns 
 */
export const weiToAvax = (wei: BigNumber) => {
  return ethers.utils.formatEther(wei);
};

/**
 * avaxToWei function
 * @param avax 
 * @returns 
 */
export const avaxToWei = (avax: string) => {
  return ethers.utils.parseEther(avax);
};

/**
 * blockTimeStampToDate fucntion
 * @param timeStamp 
 * @returns 
 */
export const blockTimeStampToDate = (timeStamp: BigNumber) => {
  return new Date(timeStamp.toNumber() * 1000); // milliseconds to seconds
};