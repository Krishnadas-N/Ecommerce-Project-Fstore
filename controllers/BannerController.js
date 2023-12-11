const { default: mongoose } = require('mongoose');
const Banner = require('../models/BannerModel');


const bannersGet = async(req,res,next)=>{
    try{
        const banners = await Banner.find({}).sort({position:1});

        res.render('bannerMangement',{ pagetitle:'Banners',banners })
    }catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
}

const bannersCreate = async (req, res,next) => {
    try {
      const { title, description, link, position } = req.body;
      let image = null;
      if (req.file) {
        image = req.file.path.replace(/\\/g, '/').replace('public/', '');
      }
  
      // Check if a banner with the same position already exists
      const existingBanner = await Banner.findOne({ position });
  
      if (existingBanner) {
        return res.status(409).json({ message: 'Banner position is already taken' });
      }
  
      // Create a new banner
      const banner = new Banner({
        title,
        image,
        description,
        link,
        position
      });
  
      await banner.save();
  
      res.status(201).json({ status: 201, message: 'Banner Created Successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Some Error caused' + err });
    }
  };
  

const bannersEdit = async(req,res,next)=>{
try{
    console.log(req.body);
    const bannerId = req.params.bannerId;
    console.log(bannerId)
    const { title, description,link,position } = req.body;

    const banner = await Banner.findById(bannerId);
    if(!banner){
        return res.status(404).json({message:'Not Forund'});
    }
    if (req.file) {
         
        newBannerimage = req.file.path.replace(/\\/g, '/').replace('public/', '');
        banner.image = newBannerimage;
     }

      banner.title=title || banner.title;
      banner.description=description||banner.description;
      banner.link=link||banner.link;
      banner.position=position||banner.position

      await banner.save();

      res.status(201).json({status:201,message:"Updated Successful"});

}catch(error){
       console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
}
}

const bannersDelete = async(req,res,next)=>{
try{
    const bannerId = req.params.bannerId;
    const deletedBanner  = await Banner.deleteOne({ _id:bannerId });
    if(deletedBanner.deletedCount===0){
        return res.status(404).json({message:'The banner is not Found'});
    }
    res.status(201).json({status:201, message: 'Banner deleted successfully' });
}catch(err){
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
}

const bannersUpdate = async (req, res,next) => {
  try {
    const bannerId = req.params.bannerId;
    const status = req.query.status === 'true'; // Convert string to boolean

    console.log(status, bannerId);

    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    
    await banner.save()
      .then(() => {
        console.log(banner);
        res.status(201).json({ status: 201, message: 'Status updated successfully', bannerStatus:banner.isActive });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { bannersGet,
    bannersCreate,
    bannersEdit,
    bannersUpdate,
    bannersDelete }