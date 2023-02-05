import { ethers } from "hardhat";
import { BigNumber, Overrides } from "ethers";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("farmNft", function () {
    const oneWeekInSecond = 60 * 60 * 24 * 7;

    /**
     * deployContract function
     * @returns 
     */
    async function deployContract() {
        const accounts = await ethers.getSigners();

        const farmerName = "farmer";
        const description = "description";
        const totalMint = BigNumber.from(5);
        const price = BigNumber.from(100);
        const expirationDate = BigNumber.from(Date.now())
        .div(1000) // in second
        .add(oneWeekInSecond); // one week later

        const FarmNft = await ethers.getContractFactory("FarmNft");
        const farmNft = await FarmNft.deploy(
            accounts[0].address,
            farmerName,
            description,
            totalMint,
            price,
            expirationDate
        );

        return {
            deployAccount: accounts[0],
            userAccounts: accounts.slice(1, accounts.length),
            farmNft,
        };
    }

    describe("mint", function () {
        it("NFT should be minted", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const buyer = userAccounts[0];
            const price = await farmNft.price();

            await farmNft.mintNFT(buyer.address, { value: price } as Overrides);

            expect(await farmNft.ownerOf(0)).to.equal(buyer.address);
        });

        it("balance should be change", async function () {
            const { deployAccount, userAccounts, farmNft } = await loadFixture(
                deployContract
            );

            const farmer = deployAccount;
            const buyer = userAccounts[0];
            const price = await farmNft.price();

            // buyer自身がmintNFTを呼び出す場合は contract.connect(buyer).mintNFT() のようにして記述します。
            // ここではbuyerがAVAX(テスト上ではイーサリアムネットワークなのでEther)を支払い, farmerにAVAXが送信されるという構図を再現したいのでbuyerからmintNFTを呼び出しました。
            // connect(buyer)を使用しない場合はdeployAccountによってmintNFTが呼び出されます。
            await expect(
                farmNft
                .connect(buyer)
                .mintNFT(buyer.address, { value: price } as Overrides)
            ).to.changeEtherBalances([farmer, buyer], [price, -price]);
        });

        it("revert when not enough nft to mint", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const buyer = userAccounts[0];
            const price = await farmNft.price();
            const totalMint = await farmNft.totalMint();

            // mintできる上限までNFTをmintします。
            for (let cnt = 0; cnt < totalMint.toNumber(); cnt++) {
                await farmNft.mintNFT(buyer.address, { value: price } as Overrides);
            }

            // 上限までmintしたので, 次のmintは失敗するはずです。
            await expect(
                farmNft.mintNFT(buyer.address, { value: price } as Overrides)
            ).to.be.reverted;
        });

        it("revert when not enough currency to mint", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const buyer = userAccounts[0];
            const price = await farmNft.price();

            await expect(
                farmNft
                .connect(buyer)
                .mintNFT(buyer.address, { value: price.sub(1) } as Overrides)
            ).to.be.reverted;
        });
    });

    describe("tokenURI", function () {
        it("check URI", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const buyer = userAccounts[0];
            const price = await farmNft.price();

            await farmNft.mintNFT(buyer.address, {
                value: price,
            } as Overrides);

            console.log("URI: ", await farmNft.tokenURI(0));
        });
    });

    describe("burnNFT", function () {
        it("token should be burned", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const buyer = userAccounts[0];
            const price = await farmNft.price();
            const expirationDate = await farmNft.expirationDate();

            await farmNft.mintNFT(buyer.address, { value: price } as Overrides);

            // mint後なので, id=0のNFTの所有者はbuyerのはずです。
            expect(await farmNft.ownerOf(0)).to.equal(buyer.address);

            // hardhatのヘルパー機能timeを使用してローカルのイーサリアムネットに, 指定したtimestampのブロックを追加します。
            // => 時間を進めてコントラクトの有効期限が切れるようにします。
            await time.increaseTo(expirationDate.add(1));

            await farmNft.burnNFT();

            // burn後なので, id=0のNFTの所有者は0(バーン時にNFTはアドレス0x0に送信されます)のはずです。
            expect(await farmNft.balanceOf(buyer.address)).to.equal(0);
        });

        it("revert when call burnNFT before expiration", async function () {
            const { farmNft } = await loadFixture(deployContract);

            await expect(farmNft.burnNFT()).to.be.reverted;
        });
    });

    describe("getTokenOwners", function () {
        it("should return valid addresses", async function () {
            const { userAccounts, farmNft } = await loadFixture(deployContract);

            const price = await farmNft.price();
            const totalMint = await farmNft.totalMint();

            for (let cnt = 0; cnt < totalMint.toNumber(); cnt++) {
                await farmNft.mintNFT(userAccounts[cnt].address, {
                value: price,
                } as Overrides);
            }

            const owners = await farmNft.getTokenOwners();

            for (let cnt = 0; cnt < totalMint.toNumber(); cnt++) {
                expect(owners[cnt]).to.equal(userAccounts[cnt].address);
            }
        });
    });
});