import React, {useRef, useState, useEffect} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import * as fp from 'fingerpose';
import QRCode from "react-qr-code";
import NumberGestures from './number';
import 'daisyui';
import '@tensorflow/tfjs-backend-wasm';
import useWindowDimensions from './getWindowsDimensions';


export default function App() {

    
    const webcamRef = useRef(null);

    const [camState,
        setCamState] = useState("on");

    const [sign, setSign] = useState(null);
    const [complete, setComplete] = useState(false);
    const [order, setOrder] = useState('');

    const [menu,setMenu] = useState([{'id':'1','name':'Garden Salad', 'description':'Just a basic salad', 'img':'https://images.unsplash.com/photo-1607532941433-304659e8198a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3778&q=80','price':'5.00'},
  {'id':2,'name':'Crispy Chicken Sandwich','description':'Better than Chic-fil-a', 'img':'https://images.unsplash.com/photo-1543874381-40fcf2b7b668?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80','price':'9.99'},
  {'id':3, 'name':'Vegan Quesadilla', 'description':'Not-so-authentic Mexican Quesadilla', 'img':'https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80', 'price':'5.99'},
  {'id':4,'name':'Pizza', 'description':'Very cheesy slice of pizza', 'img':'https://images.unsplash.com/photo-1607290817806-e93c813ff329?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80', 'price':'6.99'},
  {'id':5,'name':'Chicken Wings', 'description':'6pc chicken wings, garlic soy flavored', 'img':'https://images.unsplash.com/photo-1527477396000-e27163b481c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2653&q=80','price':'8.99' },
  {'id':6,'name':'Sushi', 'description':'Assorted sushi - not as fancy as it looks', 'img':'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2225&q=80', 'price':'11.99'},
  {'id':7, 'name':'French Fries', 'description':'Just regular french fries', 'img':'https://images.unsplash.com/photo-1623238912680-26fc5ffb57e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80','price':'2.00'},
  {'id':8,'name':'Cheesecake', 'description':'Plain cheesecake, nothing fancy','img':'https://images.unsplash.com/photo-1621955511667-e2c316e4575d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80','price':'6.99'}])

  const [cart, setCart] = useState([])




    // let net;

    const runHandpose = async () =>{
        const net = await handpose.load();
        console.log('loaded')

        // window.requestAnimationFrame(loop);

        setInterval(() => {
            detect(net);
        }, 2000);
    };






    async function detect(net) {
        // Check data is available
        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;


            // Make Detections
            const hand = await net.estimateHands(video);

            if (hand.length > 0) {
                //loading the fingerpose model
                const GE = new fp.GestureEstimator([
                    fp.Gestures.ThumbsUpGesture,
                    NumberGestures.sign1,
                    NumberGestures.sign2,
                    NumberGestures.sign3,
                    NumberGestures.sign4,
                    NumberGestures.sign5,
                    NumberGestures.sign6,
                    NumberGestures.sign7,
                    NumberGestures.sign8
                ]);

                const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5);


               

                if (estimatedGestures.gestures !== undefined && estimatedGestures.gestures.length > 0) {
                    let confidenceMax = {"name":"","score":-1}
                    for(var i =0;i<estimatedGestures.gestures.length;i++){
                      if(estimatedGestures.gestures[i].score>confidenceMax.score){
                        confidenceMax=estimatedGestures.gestures[i];
                      }
                    }
                    console.log(confidenceMax);
                    setSign(confidenceMax);
                    if(confidenceMax.name!="thumbs_up"){
                    console.log(menu[parseInt(confidenceMax.name)-1]);
                    setCart((currentCart) => currentCart.concat(menu[parseInt(confidenceMax.name)-1]))
                    }
                    else{
                      for(var i=0;i<cart.length;i++){
                        let str = order+","+cart[i].name
                        setOrder(str)
                        console.log(str,order);
                      }
                      setComplete(true)
                      
                    }
                    

                    
                }
                

            }
      
        }
    };
    const { height, width } = useWindowDimensions();

    useEffect(() => {
        runHandpose();
    },[]);

    function turnOffCamera() {
        if (camState === "on") {
            setCamState('off');
        } else {
            setCamState('on');
        }
    }
    

    return (
      <div>
<input type="checkbox" id="my-modal-4" class="modal-toggle"/>
<label for="my-modal-4" class="modal cursor-pointer">
  <label class="modal-box relative" for="">
    <h3 class="text-lg font-bold">Congratulations random Interner user!</h3>
    <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p>
  </label>
</label>
  <body class="bg-gradient-to-r from-orange-400 to-rose-400 h-screen p-10">
    <div style={{display:'-webkit-inline-flex', justifyContent:'space-between'}}>
      <div><h1 class="font-bold text-8xl">Welcome!</h1>
    <h1 class="font-semibold text-2xl">Use gestures to add items to your order, give us a thumbs up when you're ready to checkout</h1></div>
    
    
    <div class="bg-gradient-to-r from-orange-400 to-rose-400">
                    <Webcam id="webcam" class="mask mask-squircle" ref={webcamRef} style={{
                          position: "fixed",
                          height: "10%",
                          width: "10%",
                          objectFit: "cover",
                          transform: "scaleX(-1)",
                          filter: "FlipH",
                      }}/>

                    {sign &&
                        <div class="bg-gradient-to-r from-orange-400 to-rose-400" style={{
                            position: "absolute",
                            marginLeft: "auto",
                            marginRight: "auto",
                            right: "calc(50% - 50px)",
                            bottom: 100,
                            textAlign: "-webkit-center",}}>
                            <p color="white" fontSize="large">{sign.name}</p>
                       
                        </div>
                        }
      </div>
     
      
    </div>
    
    <h1 class="font-bold text-3xl pt-4">Menu</h1>
    <div style={{display:'-webkit-inline-flex', width:width, flexWrap:'wrap'}} className="gap-2">
      {menu.map((item)=><div class="card w-96 glass card-compact max-w-[200px] h-[auto]">
              <figure><img src={item.img} alt="food"/></figure>
              <div class="card-body backdrop-blur-sm bg-red-200/30">
              <button class="btn bg-red-500 btn-accent glass">{item.id}</button>
                <h2 class="card-title">{item.name}</h2>
                <p>{item.description}</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-accent glass">${item.price}</button>
                </div>
                
              </div>
            </div>)}
            
        </div>   
        <h1 class="font-bold text-3xl pt-4">Order</h1>
    <div style={{display:'-webkit-inline-flex', width:width, flexWrap:'wrap'}} className="gap-2">
    
      {cart.map((item)=><div class="card w-96 glass card-compact max-w-[200px]">
              <figure><img src={item.img} alt="food"/></figure>
              <div class="card-body">
              <button class="btn bg-red-500 btn-accent glass">{item.id}</button>
                <h2 class="card-title">{item.name}</h2>
                <p>{item.description}</p>
                <div class="card-actions justify-end">
                  <button class="btn btn-accent glass">${item.price}</button>
                </div>
                
              </div>
            </div>)}
            <div class="card glass bg-red-500 max-w-[400px]">
              <figure><QRCode value="SMSTO:+13212412208:Hi, I need help" fgColor="white" bgColor="transparent" size={180} className="p-1"/></figure>
              <div class="card-body">
                <h2 class="card-title">Need assistance?</h2>
                <p>Scan the QR code</p>
              </div>
            </div>
            {complete &&<div class="card glass bg-yellow-500 max-w-[400px]">
              <figure><QRCode value={`SMSTO:+13212412208: I'd like to order a Pizza ${order}`} fgColor="white" bgColor="transparent" size={180} className="p-1"/></figure>
              <div class="card-body">
                <h2 class="card-title">Ready to checkout?</h2>
                <p>Scan this QR code</p>
              </div>
            </div>}
            
        </div>
        
        

                
                          
    </body>
</div>  
    )
}

