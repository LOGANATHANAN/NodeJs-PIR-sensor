require('dotenv').config();
var gpio = require('rpi-gpio')
const mongoose=require('mongoose');
const db=process.env.db;

const connect = mongoose
  .connect(db, { useFindAndModify: false,useUnifiedTopology:true,useNewUrlParser:true })
  .then(() => {
      console.log("Mondo db connected....")
})
  .catch((err) => console.log(err));

const PASchema = new mongoose.Schema({
    time:{
        type:String,
        required:true
    },
    msg:{
        type:String,
        required:true
    }
});

const PA=mongoose.model('PA',PASchema);

var pir = {
  pin: 13,
  loopTime: 1000, 
  tripped: false,
  value: undefined
}

var readInterval = function() {
  gpio.read(pir.pin, function(error, value) {
if (value === pir.tripped) return
    pir.tripped = value
    if (pir.tripped){
        console.log('someone passed...');
        var d=new Date();
        var pa=new PA({
            time:d,
            msg:"someone passed the facility"
        });
        pa.save(function(err,res){
            if(err){
                console.log("Error pushing data to DB");
            }
            else{
                console.log("Activity recorded");
            }});
    }
    else console.log("watching...");
  })
}

var onSetup = function(error) {
  if (error) console.error(error)
  return setInterval(readInterval, pir.loopTime)
}

gpio.setMode(gpio.MODE_RPI)
gpio.setup(pir.pin, gpio.DIR_IN, onSetup)
