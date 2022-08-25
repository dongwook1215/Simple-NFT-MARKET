// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.24 <0.5.6;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract NFT {
        string public name = "Klay Lion";
        string public symbol = "KL"; //contract deployer

        mapping(uint256 => address) public tokenOwner;
        mapping(uint256 => string) public tokenURIs;

        //소유한 토큰 리스트
        mapping(address => uint256[]) private _ownedTokens;
        //onKIP17Received bytes value
        bytes4 private constant _KIP17_RECEIVED = 0x6745782b;

        //mint(tokenId, uri, owner)
        //transferFrom(from , to, tokenId) => owner가 바뀌는 것(from => to)
        
        function mintWithTokenURI(address to, uint256 tokenId, string memory tokenURI) public returns (bool){
            //to에게 tokenId(일련번호)를 발행하겠다.
            //적힐 글자는 tokenURI
            tokenOwner[tokenId] = to;
            tokenURIs[tokenId] = tokenURI;

            //add token to the list
            _ownedTokens[to].push(tokenId);

            return true;
        }

        function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public {
            require(from == msg.sender, "from != msg.sender");
            require(from == tokenOwner[tokenId], "you are not the owner of the token");
            //
            _removeTokenFromList(from, tokenId);
            _ownedTokens[to].push(tokenId);
            //
            tokenOwner[tokenId] = to;

            //만약에 받는 쪽이 실행할 코드가 있는 스마트 컨트렉트이면 코드를 실행할 것
            require(
                _checkOnKIP17Received(from, to, tokenId, _data), "KIP17: transfer to non KIP17Receiver implementer"
            );
        }

        function _checkOnKIP17Received( address from, address to, uint256 tokenId, bytes memory _data) internal returns (bool){
            bool success;
            bytes memory returndata;

            if(!isContract(to)){
                return true;
            }

            (success, returndata) = to.call(
                abi.encodeWithSelector(
                    _KIP17_RECEIVED,
                    msg.sender,
                    from,
                    tokenId,
                    _data
                )
            );

            if(
                returndata.length != 0 &&
                abi.decode(returndata, (bytes4)) == _KIP17_RECEIVED
            ){
                return true;
            }
            return false;

        }

        function isContract(address account) internal view returns (bool) {
            uint256 size;
            assembly { size := extcodesize(account) }
            return size > 0;
        }
        
        function _removeTokenFromList(address from, uint256 tokenId) private {
            //[10, 15, 19, 20] -> 19번을 삭제하고 싶어요
            //[10, 15, 20, 19]
            //[10, 15, 20]
            uint256 lastTokenIndex =_ownedTokens[from].length-1;
            for(uint256 i = 0; i<_ownedTokens[from].length ;i++){
                if(tokenId == _ownedTokens[from][i]){
                    // Swap last toekn with deleting token;
                    _ownedTokens[from][i] = _ownedTokens[from][lastTokenIndex];
                    _ownedTokens[from][lastTokenIndex] = tokenId;
                    break;
                }
            }
            //
            _ownedTokens[from].length--;
        }

        function ownedTokens(address owner) public view returns(uint256[] memory){
            return _ownedTokens[owner];
        }

        function setTokenUri(uint256 id, string memory uri) public {
            tokenURIs[id] = uri;
        }

}

contract NFTMarket {

    mapping(uint256 => address) public seller;


    function buyNFT(uint256 tokenId, address NFTAddress) public payable returns (bool){

        //구매한 사람한테 0.01 KLAY 전송
        address payable receiver = address(uint160(seller[tokenId]));

        // Send 0.01 KLAY ot receiver
        // 10 * 18 PEB = 1 KLAY
        // 10 * 16 PEB = 0.01 KLAY
        receiver.transfer(10 ** 16);

        NFT(NFTAddress).safeTransferFrom(address(this), msg.sender, tokenId, "0x00");
        return true;
    }


    // Market이 토큰을 받았을 때 (판매대에 올라갔을 때), 판매자가 누구인지 기록해야 함
    function onKIP17Received(address operator, address from, uint256 tokenId, bytes memory data) public returns (bytes4) {
        seller[tokenId] = from;
        return bytes4(keccak256("onKIP17Received(address,address,uint256,bytes)"));
    }
    
}