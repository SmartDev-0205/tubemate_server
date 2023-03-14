const Invite = require("../models/Invite");
const User = require("../models/User");
const ObjectId = require('mongoose').Types.ObjectId; 

const getUsers = async (req, res) => {
  try {
    const { use } = req.user;

    const users = await User.find({ isAdmin: false })
      .select("-password")
      .exec();

    res.status(200).json(users);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Login failed",
    });
  }
};








const updateReferralBonus = async (req, res) => {
  try {
    const { use } = req.user;

    console.log(req);
    console.log(req.user);
    //get current user
    const user = await User.findById(use._id).exec();

    console.log("landed on update referral");
    console.log(user);
    //check his invite relation


    const userwhoInvited = await Invite.find({ user: new ObjectId(user._id) }).exec();

    console.log(userwhoInvited);
    console.log(userwhoInvited.invited);

    console.log("test");
    // console.log(userwhoInvited[0].invited);

    
    if (userwhoInvited.length > 0){
  // increase balance $5/invite success
let id = userwhoInvited[0].invited.toString();
  //get user who invited
  const inviteUser = await User.findById(id).exec();

  console.log(inviteUser);
  if(inviteUser){
   
    //update his balance
    inviteUser.balance = inviteUser.balance + 5;
    inviteUser.invite_balance = inviteUser.invite_balance + 5;

    await inviteUser.save();
  }

    
}
     

res.status(200).json({
  message: "Updated referral user bonus",
});
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update referral failed",
    });
  }
};




const deleteUserWithId = async (req, res) => {
  try {
    const { use } = req.user;
    const { id } = req.params;

    const user = await User.findOneAndDelete({ _id: id }).exec();

    res.status(201).json({
      message: "Deleted user",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Login failed",
    });
  }
};

module.exports = {
  getUsers,
  deleteUserWithId,
  updateReferralBonus
};
