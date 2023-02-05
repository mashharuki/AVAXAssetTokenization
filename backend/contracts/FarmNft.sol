// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * FarmNft Contract
 */
contract FarmNft is ERC721 {

    address public farmerAddress;  
    string public farmerName; 
    string public description; 
    uint256 public totalMint; 
    uint256 public availableMint; 
    uint256 public price; 
    uint256 public expirationDate; 

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds; 

    /**
     * コンストラクター
     */
    constructor(
        address _farmerAddress,
        string memory _farmerName,
        string memory _description,
        uint256 _totalMint,
        uint256 _price,
        uint256 _expirationDate
    ) ERC721("Farm NFT", "FARM") {
        farmerAddress = _farmerAddress;
        farmerName = _farmerName;
        description = _description;
        totalMint = _totalMint;
        availableMint = _totalMint;
        price = _price;
        expirationDate = _expirationDate;
    }
    
    /**
     * mintNFT function
     */
    function mintNFT(address to) public payable {
        require(availableMint > 0, "Not enough nft");
        require(isExpired() == false, "Already expired");
        require(msg.value == price);

        uint256 newItemId = _tokenIds.current();
        // mint NFT
        _safeMint(to, newItemId);
        _tokenIds.increment();
        availableMint--;
        // send eth
        (bool success, ) = (farmerAddress).call{value: msg.value}("");
        require(success, "Failed to withdraw AVAX");
    }

    /**
     * tokenURI function
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        name(),
                        " -- NFT #: ",
                        Strings.toString(_tokenId),
                        '", "description": "',
                        description,
                        '", "image": "',
                        "https://i.imgur.com/GZCdtXu.jpg",
                        '"}'
                    )
                )
            )
        );
        // encode
        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }       

    /**
     * isExpired function
     */
    function isExpired() public view returns (bool) {
        if (expirationDate < block.timestamp) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * burnNFT function
     */
    function burnNFT() public {
        require(isExpired(), "still available");
        for (uint256 id = 0; id < _tokenIds.current(); id++) {
            _burn(id);
        }
    }

    /**
     * getTokenOwners function
     */
    function getTokenOwners() public view returns (address[] memory) {
        address[] memory owners = new address[](_tokenIds.current());
        for (uint256 index = 0; index < _tokenIds.current(); index++) {
            owners[index] = ownerOf(index);
        }
        return owners;
    }
}