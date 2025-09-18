import {Asynchandler} from "../Utils/Asynchandler.js"
import {ApiResponse}  from "../Utils/Apiresponse.js"
import {ApiError} from '../Utils/Apierror.js'
 import { User } from "../Models/User.models.js"
import  jwt from "jsonwebtoken";
import { uploadonCloudinary } from "../Utils/Cloudinary.js";

   const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = jwt.sign(
          {user : user._id ,
            FirstName : user.FirstName,
            LastName : user.LastName ,
            email : user.email
          } ,
          process.env.ACCESS_TOKEN ,
          {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
          }
        )
        
        const refreshToken = jwt.sign(
          {user : user._id} ,
          process.env.REFRESH_TOKEN ,
          {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
          }
        )
 
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (e) {
     console.error("Token generation error:", e.message);
    throw new ApiError(400 ,"Failed to generate tokens");
    }
};

const registeruser = Asynchandler( async (req, res) => {
    
    const {fullName, email, username, password ,Class} = req.body

    if (
        [fullName, email, username, password ,Class ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
     
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

const image = await uploadonCloudinary(req.file?.path)

if (!image) {
  return res.status(500).json({ message: "Cloud upload failed" });
}

    const user = await User.create({
        fullName,
        image : image.secure_url ,
        email, 
        password,
        username: username,
        Class: Number(Class)
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginuser = Asynchandler(async(req ,res)=>{
       const {username , password} = req.body
              
   if(!username) throw new ApiError(400 , "username is required")

      if(!password) throw new ApiError(400 , "Password is required")

      const user = await User.findOne({username })

      if(!user) throw new ApiError(400 , "User does not exist")


   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   const options = {
        httpOnly: true,
        secure: true
    }
       return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})



const logoutUser = Asynchandler(async(req, res) => {
   
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
  });
  res.status(200).json({ message: "Logged out" });
});

  const getCurrentUser = (req, res) => {
  const user = req.user; 
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user });
};

const updateAccountDetails = Asynchandler(async (req, res) => {
    console.log("req.body 👉", req.body) || {}
    const { email, FirstName } = req.body
    if (!FirstName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { FirstName, email } },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});


export {
    registeruser,
     loginuser,
     logoutUser,
     getCurrentUser,
    updateAccountDetails
}