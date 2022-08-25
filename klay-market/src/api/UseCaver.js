import Caver from 'caver-js';
import KIP17ABI from '../abi/KIP17TokenABI.json';
import { ACCESS_KEY_ID, 
         SECRET_ACCESS_KEY, 
         NFT_CONTRACT_ADDRESS, 
         CHAIN_ID } from '../constants/index';

const option = {
  headers:[{
    name:"Authorization",
    value:"Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64")
  },{
    name: "x-chain-id",
    value: CHAIN_ID
  }]
}

const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn",option))
const NFTContract = new caver.contract(KIP17ABI,NFT_CONTRACT_ADDRESS)


export const fetchCardsOf = async (address) => {
  //fetch Balance
  const balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`[NFT Balance]:`,balance);

  //fetch Token IDs
  const tokenIds = [];
  for(let i = 0; i < balance; i++){
    const id = await NFTContract.methods.tokenOfOwnerByIndex(address,i).call();
    tokenIds.push(id);

  }

  //fetch Token URIs
  const tokenUris = [];
  for(let i = 0; i < balance; i++){
    const id = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenUris.push(id);
  }

  const nfts = [];
  for(let i = 0; i < balance; i++){
    nfts.push({uri: tokenUris[i], id:tokenIds[i]})
  }

  console.log(nfts)

  return nfts
}

export const getBalance = (address) => {
  return caver.rpc.klay.getBalance(address).then((response) => {
    const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
    console.log(`Balance: ${balance}`);
    return balance;
  })
}

// import CounterABI from '../abi/CounterABI.json';
// const CountContract = new caver.contract(CounterABI,COUNT_CONTRACT_ADDRESS);

// export const readCount = async () => {
//   const _count = await CountContract.methods.count().call();
//   console.log(_count);
// }

// export const setCount = async (newCount) => {

//   try{
//     //사용할 account 설정
//     const privatekey = `0xdb009218ebacc44c8de878d1009618801c273e964ebbbcfff5cc2617707e5227`;
//     const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
//     caver.wallet.add(deployer);
    
//     //스마트 컨트렉트 실행 트렌젝션 날리기

//     //결과 확인
//     const receipt = await CountContract.methods.setCount(newCount).send({
//       from: deployer.address, // address
//       gas: `0x4bfd200` //
//     })

//     console.log(receipt);
//   }catch(e){
//     console.log(`Error: ${e}`);
//   }
// }