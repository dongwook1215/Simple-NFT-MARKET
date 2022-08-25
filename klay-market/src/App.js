import React,{useEffect, useState} from 'react';
import logo from './logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHome, faWallet, faPlus} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './market.css';
import { fetchCardsOf, getBalance } from './api/UseCaver';
import QRCode from 'qrcode.react';
import * as KlipAPI from "./api/UseKlip";
import { Alert, Container, Card, Nav, Form, Button, Modal, Row, Col } from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from './constants';

// 1.smart contract 배포 및 주소 파ㄱ
// 2.caver.js를 이용해서 스마트 컨트렉트 연동하기
// 3.가져온 스마트 컨트렉트 실행 결과(데이터) 웹에 표현하기

const onPressButton = (_balance,_setBalance) => {
  _setBalance(_balance);
}

const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = `0x0000000000000000000000000000000000000000`;

function App() {

  // State Data

  // Gloval Data
  // address
  // NFT
  const [nfts,setNFTs]=useState([]); //{tokenId:'101',tokenURI:''}
  const [myBalance,setMyBalance] = useState('0');
  const [myAddress,setMyAddress] = useState(DEFAULT_ADDRESS)

  //UI
  const [qrvalue, setOrvalue] = useState(DEFAULT_QR_CODE);
  //tab
  const [tab, setTab] = useState('MINT') //MARKET, MINT, WALLET
  const [mintImageUrl, setMintImageUrl] = useState("")
  //mintInput

  //Modal
  const [showModal,setShowModal] = useState(false);
  const [modalProps,setModalProps] = useState({
    title:"MODAL",
    onConfirm: () => {},
  })

  const rows = nfts.slice(nfts.length /2);

  //fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    //1. balanceOf => 내가 가진 전체 NFT 토큰 개수를 가져온다
    //2. tokenOfOwnerByIndex => 내가 가진 NFT token ID를 하나씩 가져온다. / 배열을 이용
    //3. tokenURI => 앞에서 가져온 tokenID를 이용해서 token URI를 하나씩 가져온다.
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNFTs(_nfts);
  } 

  //fetchMyNFTs
  const fetchMyNFTs = async () => {
    //1. balanceOf => 내가 가진 전체 NFT 토큰 개수를 가져온다
    //2. tokenOfOwnerByIndex => 내가 가진 NFT token ID를 하나씩 가져온다. / 배열을 이용
    //3. tokenURI => 앞에서 가져온 tokenID를 이용해서 token URI를 하나씩 가져온다.
    if(myAddress === DEFAULT_ADDRESS){
      alert('NO ADDRESS');
      return;
    }
    const _nfts = await fetchCardsOf(myAddress);
    setNFTs(_nfts);
  } 

  //onClickMint
  const onClickMint = async (uri) => {
    if(myAddress !== DEFAULT_ADDRESS){
      const randomTokenId = parseInt(Math.random() * 1000000000)
      KlipAPI.mintCardWithURI(myAddress, randomTokenId, uri, setOrvalue, (result) => {
        alert(JSON.stringify(result))
      })
    }else{
      alert('NO ADDRESS');
      return;
    }
  }

  const onClickCard = (id) => {
    if(tab === 'WALLET') {
      setModalProps({
        title:'NFT를 마켓에 올리시겠어요?',
        onConfirm: () => {onClickMyCard(id)}
      })
      setShowModal(true);
    }
    if(tab === 'MARKET'){
      setModalProps({
        title:'NFT를 구매하시겠어요?',
        onConfirm:() => {onClickMarketCard(id);}
      })
      setShowModal(true);
    }
  }

  //onClickMyCard
  const onClickMyCard = (tokenId) => {
    KlipAPI.listingCard(myAddress,tokenId,setOrvalue, (result) => {
      alert(JSON.stringify(result))
    })
  }

  //onClickMarketCard
  const onClickMarketCard = (tokenId) => {
    KlipAPI.buyCard(tokenId,setOrvalue, (result) => {
      alert(JSON.stringify(result))
    })
  }
  
  const getUserData = () => {
    setModalProps({
      title:"Klip 지갑을 연동하시겠습니까?",
      onConfirm:() => {
        KlipAPI.getAddress(setOrvalue,async (address) => {
          setMyAddress(address)
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });
      }
    })
    setShowModal(true);
  }

  useEffect(() => {
    getUserData();
    fetchMarketNFTs()
  },[])

  return (
    <div className="App">
      <div style={{backgroundColor: "black", padding: 10}}>
        
        {/* 주소 잔고 */}
        <div style={{
            fontSize:30,
            fontWeight: "bold",
            paddingLeft: 5,
            marginTop: 10
          }}
        >내 지갑</div>
        {myAddress}
        <br/>
        <Alert onClick={getUserData} variant={"balance"} style={{backgroundColor:"#606060", fontSize: 25}} >
          {myAddress !== DEFAULT_ADDRESS ? `${myBalance} KLAY` : '지갑 연동하기'}
        </Alert>
        {qrvalue !== "DEFAULT" ? 
        (<Container style={{
                            backgroundColor: "white",
                            width: 300,
                            height: 300,
                            padding: 20
          }}
        >
          <QRCode size={256} style={{margin:"auto"}} value={qrvalue}/>
          <br/>
        </Container>): null}
        
        {/* 갤러리(마켓, 내 지갑) */}
        {tab === 'MARKET' || tab === 'WALLET' ? <div className='container' style={{padding:0, width:"100%"}}>
          {rows.map((o,rowIndex) => (
            <Row>
              <Col style={{marginRight: 0, paddingRight: 0}}>
                <Card onClick={()=> {
                  onClickCard(nfts[rowIndex*2].id)
                }} 
                >
                  <Card.Img src={nfts[rowIndex*2].uri} />
                </Card>
                [{nfts[rowIndex *2].id}]NFT
              </Col>
              <Col style={{marginRight: 0, paddingRight: 0}}>
                {nfts.length > rowIndex * 2 + 1 ? (
                  <Card onClick={()=> {
                    onClickCard(nfts[rowIndex*2+1].id)
                  }} 
                  >
                    <Card.Img src={nfts[rowIndex*2+1].uri} />
                  </Card>  
                ) : null }
                {nfts.length > rowIndex * 2 + 1 ? (
                  <>[{nfts[rowIndex *2].id}]NFT</>
                ):null}
              </Col>
            </Row>
          ))}
          {/* {nfts.map((nft,index) => (
            <Card.Img key={`imagekey${index}`} onClick={() => {onClickCard(nft.id)}} className='img-responsive' src={nfts[index].uri} />
          ))} */}
        </div>  : null}

        {/* 발행 페이지 */}
        {tab === "MINT" ? <div className='container' style={{padding:0, width:"100%"}}>
            <Card
              className='text-center'
              style={{color:"black", height:"50%", borderColor:"#C5B358"}} 
            >
              <Card.Body style={{opacity: 0.9, backgroundColor:"black"}}>
                {mintImageUrl !== "" ? <Card.Img src={mintImageUrl} height={"50%"} /> : null}
                <Form>
                  <Form.Group>
                    <Form.Control 
                      value={mintImageUrl}
                      onChange={(e)=>{
                        setMintImageUrl(e.target.value)
                      }}
                      type="text"
                      placeholder='이미지 주소를 입력해주세요'
                    />
                  </Form.Group>
                  <br />
                  <Button onClick={()=>{onClickMint(mintImageUrl)}} 
                          variant='primary' 
                          style={{backgroundColor:"#810034",borderColor:"#810034"}}>
                    발행하기
                  </Button>
                </Form>
              </Card.Body>
            </Card>
        </div> : null}
      

      </div>
        {/* <br/>
        <br/>
        <br/>
        <br/> */}
        {/* 모달 */}
        <Modal
          centered
          size="sm"
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
          style={{border:0}}
        >
          <Modal.Header
            style={{border:0,backgroundColor:"black",opacity: 0.8}}
          >
            <Modal.Title>{modalProps.title}</Modal.Title>
          </Modal.Header>
          <Modal.Footer
            style={{border:0,backgroundColor:"black",opacity:0.8}}
          >
            <Button 
              variant='secondary'
              onClick={() => {
                setShowModal(false);
              }}
            >
                닫기
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                modalProps.onConfirm();
                setShowModal(false);
              }}
              style={{backgroundColor:"#810034",borderColor:"#810034"}}
            >
              진행
            </Button>
          </Modal.Footer>
        </Modal>

        {/* 탭 */}
        <nav style={{backgroundColor: "#1b1717",height:45}} className="navBar fixed-bottom navbar-light" role="navigation">
          <Nav className="w-100">
            <div className='d-flex flex-row justify-content-around w-100'>

              <div onClick={() => {
                setTab("MARKET");
                fetchMarketNFTs();
              }}
                className='row d-flex flex-column justify-content-center align-items-center'
              >
                <div>
                  <FontAwesomeIcon color='white' size='lg' icon={faHome}/>
                </div>
              </div>

              <div onClick={() => {
                setTab("MINT");
              }}
                className='row d-flex flex-column justify-content-center align-items-center'
              >
                <div>
                  <FontAwesomeIcon color='white' size='lg' icon={faPlus}/>
                </div>
              </div>

              <div onClick={() => {
                setTab("WALLET");
                fetchMyNFTs();
              }}
                className='row d-flex flex-column justify-content-center align-items-center'
              >
                <div>
                  <FontAwesomeIcon color='white' size='lg' icon={faWallet}/>
                </div>
              </div>

            </div>
          </Nav>
        </nav>
    </div>
  );
}

export default App;
