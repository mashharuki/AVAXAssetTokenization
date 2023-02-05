import { ethers } from "hardhat";

/**
 * deploy script
 */
async function deploy() {
  // コントラクトをデプロイするアカウントのアドレスを取得します。
  const [deployer] = await ethers.getSigners();

  // AssetTokenizationコントラクトをデプロイします。
  const AssetTokenization = await ethers.getContractFactory(
    "AssetTokenization"
  );
  const assetTokenization = await AssetTokenization.deploy();
  await assetTokenization.deployed();

  console.log("assetTokenization address:", assetTokenization.address);
  console.log("account address that deploy contract:", deployer.address);
}

deploy()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });