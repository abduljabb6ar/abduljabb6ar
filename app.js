var paypal =require('paypal-rest-sdk');
var express=require('express');
var app=express();
var amount=0;
var bodyparse=require('body-parser');
const port = process.env.PORT || 3000; // استخدم البورت المحدد من مزود الاستضافة أو 8000 كبديل

app.use(
    bodyparse.urlencoded({
        extended:false
    })
);
app.use(bodyparse.json())
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeLRi3P8vEDDKR3ioVySQ8V-vwt0cy2XGgSLYFlL_DnBvkiz4uB-TqtHkmMO35-oHZiYDQDFPNZylOuw',
    'client_secret': 'EEEF9h7kS2RtLPzMbwH8kFjyUbUreZLdqZ7jGSLhlndWOMs9EYAcxXkdiTpmB67-KYrHcE314_KU0y79'
  });
  app.post('/pay',(req,res)=>{
    console.log(req.body);
    amount=req.body.price;
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:8000:success",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name":"item",
                    "sku": "item",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": "This is the payment description."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            for(let i=0 ;i<payment.links.length;i++){
                if(payment.links[i].rel==="approval_url"){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
  });
  app.get('/seccess',(req,res)=>{
    var execute_payment_json = {
        "payer_id": req.query.payer_id,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amount
            }
        }]
    };
    
    var paymentId = req.query.paymentId;
    
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
        }
    });
  });
app.listen(port,(req,res)=>{
    console.log(`Server started on port ${port}`);
// console.log("server started "+$port)
});