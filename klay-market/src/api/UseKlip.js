import axios from "axios";
import { COUNT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants";

const A2P_API_PREPARE_URL = `https://a2a-api.klipwallet.com/v2/a2a/prepare`;
const APP_NAME = "KLAY_MARKET";
const isMobile = window.screen.width >= 1280 ? false : true;

const getKlipAccessUrl = (method, request_key) => {
    if(method === 'QR'){
        return `https://klipwallet.com/?target=/a2a?request_key=${request_key}`
    }
    return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`
    // if(method === 'iOS'){
        // return `kakaotalk://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}`
    // }
    // if(method ===  'android'){
        // return `intent://klipwallet/open?url=https://klipwallet.com/?target=/a2a?request_key=${request_key}#Intent;scheme=kakaotalk;package=com.kakao.talk;end`
    // }
}

export const buyCard = async (tokenId, setQrvalue, callback) => {
    const functionJSON = `{ "constant": false, "inputs": [ { "name": "tokenId", "type": "uint256" }, { "name": "NFTAddress", "type": "address" } ], "name": "buyNFT", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }`;
    excuteContract(MARKET_CONTRACT_ADDRESS, functionJSON, "10000000000000000", `[\"${tokenId}\",\"${NFT_CONTRACT_ADDRESS}\"]`, setQrvalue, callback);
}

export const listingCard = async (fromAddress, tokenId, setQrvalue, callback) => {
    const functionJSON = `{ "constant": false, "inputs": [ { "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }`;
    excuteContract(NFT_CONTRACT_ADDRESS, functionJSON, "0", `[\"${fromAddress}\",\"${MARKET_CONTRACT_ADDRESS}\",\"${tokenId}\"]`, setQrvalue, callback);
}

export const mintCardWithURI = async (toAddress, tokenId, uri, setQrvalue, callback) => {
    const functionJSON = `{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "tokenURI", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }`;
    excuteContract(NFT_CONTRACT_ADDRESS,functionJSON,"0",`[\"${toAddress}\",\"${tokenId}\",\"${uri}\"]`,setQrvalue,callback);
}

export const excuteContract = (txTo, functionJSON, value, params, setQrvalue, callback) => {
    axios.post(
        A2P_API_PREPARE_URL,{
            bapp: {
                name:APP_NAME
            },
            type:"execute_contract",
            transaction: {
                // "from": "0x8756...4321", // optional
                "to": txTo, // contract address
                "value": value, // 단위는 peb. 1 KLAY
                "abi": functionJSON,
                "params": params
              }
        }
    ).then((response) => {
        const { request_key } = response.data;

        if(isMobile){
            window.location.href = getKlipAccessUrl('android', request_key);
        }else{
            setQrvalue(getKlipAccessUrl("QR",request_key));    
        }

        let timerId = setInterval(()=> {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if(res.data.result){
                    console.log(JSON.stringify(res.data.result));
                    if(res.data.result.status === 'success'){
                        callback(res.data.result)
                        clearInterval(timerId);
                        setQrvalue("DEFAULT");
                    }
                }
            })
        },1000)
    })
}

export const getAddress = (setQrvalue,callback) => {
    axios.post(
        A2P_API_PREPARE_URL,{
            bapp: {
                name:APP_NAME
            },
            type:"auth"
        }
    ).then((response) => {
        const { request_key } = response.data;
        if(isMobile){
            window.location.href = getKlipAccessUrl('android', request_key);
        }else{
            setQrvalue(getKlipAccessUrl("QR",request_key));    
        }

        let timerId = setInterval(()=> {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if(res.data.result){
                    console.log(JSON.stringify(res.data.result));
                    callback(res.data.result.klaytn_address);
                    clearInterval(timerId);
                    setQrvalue("DEFAULT");
                }
            })
        },1000)
    })
}

// export const setCount = (count,setQrvalue) => {
//     axios.post(
//         A2P_API_PREPARE_URL,{
//             bapp: {
//                 name:APP_NAME
//             },
//             type:"execute_contract",
//             transaction: {
//                 // "from": "0x8756...4321", // optional
//                 "to": COUNT_CONTRACT_ADDRESS, // contract address
//                 "value": "0", // 단위는 peb. 1 KLAY
//                 "abi": `{ "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }`,
//                 "params": `[\"${count}\"]`
//               }
//         }
//     ).then((response) => {
//         const { request_key } = response.data;
//         const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

//         setQrvalue(qrcode);

//         let timerId = setInterval(()=> {
//             axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
//                 if(res.data.result){
//                     console.log(JSON.stringify(res.data.result));
//                     if(res.data.result.status === 'success'){
//                         clearInterval(timerId);
//                     }
//                 }
//             })
//         },1000)
//     })
// }