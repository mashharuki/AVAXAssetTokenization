import { ethers } from "hardhat";
import { BigNumber, Overrides } from "ethers";
import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AssetTokenization", function () {
    const oneWeekInSecond = 60 * 60 * 24 * 7;

    /**
     * deployContract function
     * @returns 
     */
    async function deployContract() {
        const accounts = await ethers.getSigners();

        const AssetTokenization = await ethers.getContractFactory(
            "AssetTokenization"
        );
        const assetTokenization = await AssetTokenization.deploy();

        return {
            deployAccount: accounts[0],
            userAccounts: accounts.slice(1, accounts.length),
            assetTokenization,
        };
    }

    describe("basic", function () {
        it("generate NFT contract and check details", async function () {
            const { userAccounts, assetTokenization } = await loadFixture(
                deployContract
            );

            const farmerName = "farmer";
            const description = "description";
            const totalMint = BigNumber.from(5);
            const price = BigNumber.from(100);
            const expirationDate = BigNumber.from(Date.now())
                .div(1000) // in second
                .add(oneWeekInSecond); // one week later

            const farmer1 = userAccounts[0];
            const farmer2 = userAccounts[1];

            await assetTokenization
                .connect(farmer1)
                .generateNftContract(
                    farmerName,
                    description,
                    totalMint,
                    price,
                    expirationDate
            );

            await assetTokenization
                .connect(farmer2)
                .generateNftContract(
                    farmerName,
                    description,
                    totalMint,
                    price,
                    expirationDate
                );

            const details1 = await assetTokenization.getNftContractDetails(
                farmer1.address
            );
            expect(details1.farmerAddress).to.equal(farmer1.address);
            expect(details1.farmerName).to.equal(farmerName);
            expect(details1.description).to.equal(description);
            expect(details1.totalMint).to.equal(totalMint);
            expect(details1.availableMint).to.equal(totalMint);
            expect(details1.price).to.equal(price);
            expect(details1.expirationDate).to.equal(expirationDate);

            const details2 = await assetTokenization.getNftContractDetails(
                farmer2.address
            );
            expect(details2.farmerAddress).to.equal(farmer2.address);
            expect(details2.farmerName).to.equal(farmerName);
            expect(details2.description).to.equal(description);
            expect(details2.totalMint).to.equal(totalMint);
            expect(details2.availableMint).to.equal(totalMint);
            expect(details2.price).to.equal(price);
            expect(details2.expirationDate).to.equal(expirationDate);
        });
    });

    describe("buyNFT", function () {
        it("balance should be change", async function () {
            const { userAccounts, assetTokenization } = await loadFixture(
                deployContract
            );

            const farmerName = "farmer";
            const description = "description";
            const totalMint = BigNumber.from(5);
            const price = BigNumber.from(100);
            const expirationDate = BigNumber.from(Date.now())
                .div(1000) // in second
                .add(oneWeekInSecond); // one week later

            const farmer = userAccounts[0];
            const buyer = userAccounts[1];

            await assetTokenization
                .connect(farmer)
                .generateNftContract(
                    farmerName,
                    description,
                    totalMint,
                    price,
                    expirationDate
                );

            await expect(
                assetTokenization
                .connect(buyer)
                .buyNft(farmer.address, { value: price } as Overrides)
            ).to.changeEtherBalances([farmer, buyer], [price, -price]);
        });
    });

    describe("upkeep", function () {
        it("checkUpkeep and performUpkeep", async function () {
            const { userAccounts, assetTokenization } = await loadFixture(
                deployContract
            );
        
            // 定数用意
            const farmer = userAccounts[0];
            const farmerName = "farmer";
            const description = "description";
            const totalMint = BigNumber.from(5);
            const price = BigNumber.from(100);
            const expirationDate = BigNumber.from(Date.now())
                .div(1000) // in second
                .add(oneWeekInSecond); // one week later
        
            // nftコントラクトをデプロイ
            await assetTokenization
                .connect(farmer)
                .generateNftContract(
                    farmerName,
                    description,
                    totalMint,
                    price,
                    expirationDate
                );
        
            const [return1] = await assetTokenization.checkUpkeep("0x00");
        
            // この時点では期限切れのnftコントラクトがないのでfalse
            expect(return1).to.equal(false);
        
            // ブロックチェーンのタイムスタンプを変更(期限の1s後のタイムスタンプを含んだブロックを生成)し, nftコントラクトの期限が切れるようにします。
            await time.increaseTo(expirationDate.add(1));
        
            const [return2] = await assetTokenization.checkUpkeep("0x00");
        
            // 期限切れのnftコントラクトがあるのでtrue
            expect(return2).to.equal(true);
        
            await assetTokenization.performUpkeep("0x00");
            // 期限切れのnftコントラクトの情報は取得できない
            await expect(assetTokenization.getNftContractDetails(farmer.address)).to.be.reverted;
        });
    });
});