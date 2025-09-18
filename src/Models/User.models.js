import mongoose from "mongoose";
 import bcrypt from "bcrypt" 
import { Schema } from "mongoose";


const userschema = new Schema({
     username : {
        type : String ,
         required : true ,
         unique : true ,
         lowercase : true,
         trim : true ,
         index : true
     } ,
      email : {
        type : String ,
        required : true ,
        unique : true ,
         lowercase : true,
         trim : true ,
      },
      password : {
        type : String ,
        required : [true , "password is required"]
      }, 
       fullName : {
        type : String ,
        required : true ,
         trim : true ,
         index : true,
      },
       image : {
        type :String 
      },
      Class : {
    type : Number
      },
  
        refreshToken : {
            type: String,
        },
 } ,{timestamps : true}
) ;

userschema.pre("save" , async function(next){
  if(!this.isModified("password")) return next() ;
     this.password = await bcrypt.hash(this.password , 10)
          next() ;
})

 
 export const User = mongoose.model("User", userschema) ;